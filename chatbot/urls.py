from django.urls import path
from . import views

urlpatterns = [
    path("chat/", views.chat),
    path("chat/stream/", views.chat_stream),
    path("reset/", views.reset_chat),
]