import json
import random

from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt

from .models import Player, Room, WordList, Word
from .utils import validate_post_data, notify_room, check_guess


@csrf_exempt
def register(request):
    if request.method == 'POST':
        post_data = json.loads(request.body)
        username = post_data.get('username')
        password = post_data.get('password')

        if not username or not password:
            return JsonResponse({'error': 'Username and password are required'}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)

        User.objects.create_user(username=username, password=password)
        return JsonResponse({'message': 'User registered successfully'}, status=201)
    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def user_login(request):
    if request.method == 'POST':
        post_data = json.loads(request.body)
        username = post_data.get('username')
        password = post_data.get('password')

        if not username or not password:
            return JsonResponse({'error': 'Username and password are required'}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None and user.is_active:
            login(request, user)
            return JsonResponse({'message': 'Login successful'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
@login_required
@validate_post_data(
    ['room_number', 'password', 'player_name', 'word_length', 'word_list_name', 'score'],
    [int, str, str, int, str, int],
    nullable_args=['room_number', 'player_name']
)
def create_room(request):
    if request.method == 'POST':
        post_data = json.loads(request.body)
        room_number = post_data.get('room_number')
        password = post_data.get('password')
        player_name = post_data.get('player_name', "host_player")
        word_length = post_data.get('word_length', 5)
        word_list_name = post_data.get('word_list_name', '考研')
        target_score = post_data.get('score', 10)

        if room_number:
            if Room.objects.filter(room_number=room_number, is_active=True).exists():
                return JsonResponse({'error': 'Room number already exists'}, status=400)
            if room_number < 1000 or room_number > 9999:
                return JsonResponse({'error': 'Room number must be a 4-digit number'}, status=400)
        word_list = get_object_or_404(WordList, name=word_list_name)
        words = Word.objects.filter(length=word_length, word_list_id=word_list.id)
        selected_words = random.sample(list(words), target_score)
        answers = [word.word for word in selected_words]

        room_number = random.randint(1000, 9999) if not room_number else room_number
        room = Room.objects.create(
            room_number=room_number,
            password=password,
            word_list=word_list,
            answers=','.join(answers),
            target_score=target_score,
            word_length=word_length)
        Player.objects.create(user=request.user, name=player_name, room=room)

        return JsonResponse({'room_number': room_number})
    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
@login_required
@validate_post_data(
    ['room_number', 'password', 'player_name'],
    [int, str, str],
    nullable_args=['player_name']
)
def join_room(request):
    if request.method == 'POST':
        post_data = json.loads(request.body)
        room_number = post_data.get('room_number')
        password = post_data.get('password')
        player_name = post_data.get('player_name', 'away_player')

        room = get_object_or_404(Room, room_number=room_number)
        if room.password != password:
            return JsonResponse({'error': 'Incorrect password'}, status=400)
        if Player.objects.filter(name=player_name, room=room).exists():
            return JsonResponse({'error': 'Player name already exists in this room, please choose another name'}, status=400)
        Player.objects.create(user=request.user, name=player_name, room=room)

        notify_room(room_number, f'{player_name} has joined the room.')

        return JsonResponse({'status': 'joined', 'room_number': room_number})
    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
@login_required
def set_ready_status(request):
    if request.method == 'POST':
        user = request.user

        room = get_object_or_404(Room, player__user=user)
        player = get_object_or_404(Player, room=room, user=user)
        player.is_ready = True  # 不许取消准备
        player.save()

        message = f'{player.name} is now ready'
        notify_room(str(room.number), message)

        return JsonResponse({'status': 'waiting for players'})
    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
@login_required
def start_game(request):
    user = request.user
    room = get_object_or_404(Room, player__user=user)
    if room.players.count() == 2 and all(player.is_ready for player in room.players.all()):
        return JsonResponse({'status': 'started', 'word_length': room.word_length})
    return JsonResponse({'status': 'waiting for players'})


@csrf_exempt
@login_required
def make_guess(request):
    user = request.user
    room = get_object_or_404(Room, player__user=user)
    player = get_object_or_404(Player, room=room, user=user)
    post_data = json.loads(request.body)
    guess = post_data.get('guess')

    answers = room.answers.split(',')
    current_answer = answers[player.score]

    exact_matches, wrong_place = check_guess(guess, current_answer)

    if exact_matches == len(current_answer):
        player.score += 1
        player.save()
        message = f'{player.name} get one point!'
        notify_room(str(room.number), message)

        if player.score >= room.target_score:
            message = f'{player.name} wins the game!'
            notify_room(str(room.number), message)
            room.is_active = False
            room.save()

    return JsonResponse({'exact_matches': exact_matches, 'wrong_place': wrong_place})
