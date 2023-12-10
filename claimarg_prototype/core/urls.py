from django.urls import path
from .views import add_message, create_link, create_link_ajax, delete_link, delete_message, graph_data, post_message, show_messages, success

urlpatterns = [
    path('post_message/', post_message, name='post_message'),
    path('success/', success, name='success'),
    path('show_messages/', show_messages, name='show_messages'),
    path('create_link/', create_link, name='create_link'),
    path('create_link_ajax/', create_link_ajax, name='create_link_ajax'),
    path('graph_data/', graph_data, name='graph_data'),
    path('delete_link/', delete_link, name='delete_link'),
    path('delete_message/', delete_message, name='delete_message'),
    path('add_message/', add_message, name='add_message'),
]
