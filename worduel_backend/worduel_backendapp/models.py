from django.db import models
from django.contrib.auth.models import User


class Room(models.Model):
    room_number = models.PositiveSmallIntegerField()
    password = models.CharField(max_length=20)
    wordlist = models.ForeignKey('Wordlist', on_delete=models.CASCADE)
    answers = models.TextField()
    target_score = models.PositiveSmallIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Player(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=20, blank=True, null=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='players')
    is_ready = models.BooleanField(default=False)
    score = models.PositiveSmallIntegerField(default=0)


class WordList(models.Model):
    name = models.CharField(max_length=100)


class Word(models.Model):
    word = models.CharField(max_length=100)
    length = models.PositiveSmallIntegerField()
    wordlists = models.ManyToManyField(WordList, related_name='words')
