from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/room/<int:room_number>/', consumers.RoomConsumer.as_asgi()),
]
