import json
from functools import wraps

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.http import JsonResponse


def validate_post_data(args, arg_types, nullable_args=None):
    if nullable_args is None:
        nullable_args = []

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            post_data = json.loads(request.body)
            for arg, arg_type in zip(args, arg_types):
                value = post_data.get(arg)
                if value is None and arg in nullable_args:
                    continue
                if not isinstance(value, arg_type):
                    return JsonResponse({'error': f'Invalid type for {arg}, expected {arg_type.__name__}'}, status=400)
            request.validated_data = post_data
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator


def notify_room(room_number, message, message_type='room_message', exclude_self=False):
    channel_layer = get_channel_layer()
    group_name = f'room_{room_number}'

    group = async_to_sync(channel_layer.group_channels)(group_name)

    if exclude_self:
        current_channel = async_to_sync(channel_layer.send)('get_current_channel', {})
        group = [channel for channel in group if channel != current_channel]

    for channel in group:
        async_to_sync(channel_layer.send)(channel, {
            'type': message_type,
            'message': message
        })


def check_guess(guess, answer):
    exact_matches = 0
    wrong_place = 0
    answer_letters = list(answer)
    guessed_letters = list(guess)

    for i in range(len(answer)):
        if guessed_letters[i] == answer_letters[i]:
            exact_matches += 1
            guessed_letters[i] = None
            answer_letters[i] = None

    for i in range(len(answer)):
        if guessed_letters[i] and guessed_letters[i] in answer_letters:
            wrong_place += 1
            answer_letters[answer_letters.index(guessed_letters[i])] = None

    return exact_matches, wrong_place
