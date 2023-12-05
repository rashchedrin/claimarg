from django.urls import path
from .views import create_link, graph_data, post_message, show_messages, success

urlpatterns = [
    path('post_message/', post_message, name='post_message'),
    path('success/', success, name='success'),
    path('show_messages/', show_messages, name='show_messages'),
    path('create_link/', create_link, name='create_link'),
    path('graph_data/', graph_data, name='graph_data'),
]
