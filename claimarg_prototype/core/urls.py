from django.urls import path
from .views import post_message, show_messages, success

urlpatterns = [
    path('post_message/', post_message, name='post_message'),
    path('success/', success, name='success'),
    path('show_messages/', show_messages, name='show_messages'),
]
