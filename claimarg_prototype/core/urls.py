from django.urls import path
from .views import post_message, success

urlpatterns = [
    path('post_message/', post_message, name='post_message'),
    path('success/', success, name='success'),
]
