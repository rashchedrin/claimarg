from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.urls import reverse
from .models import Link, Message

def post_message(request):
    if request.method == 'POST':
        message_content = request.POST.get('content')
        message_type = request.POST.get('type')
        default_user = User.objects.get(username='default')

        Message.objects.create(
            content=message_content,
            type=message_type,
            author=default_user
        )
        return redirect(reverse('post_message'))  # Redirect to a success page or home

    messages = Message.objects.all()  # Retrieve all messages for display
    links = Link.objects.all()  # Retrieve all messages for display
    return render(request, 'post_and_show_messages.html', {'messages': messages, 'links': links})


def success(request):
    return render(request, 'success.html')


def show_messages(request):
    messages = Message.objects.all()  # Retrieve all messages
    return render(request, 'show_messages.html', {'messages': messages})


def create_link(request):
    if request.method == 'POST':
        source_id = request.POST.get('source_message')
        target_id = request.POST.get('target_message')
        source_message = Message.objects.get(id=source_id)
        target_message = Message.objects.get(id=target_id)
        default_user = User.objects.get(username='default')

        link_type = request.POST.get('link_type')

        Link.objects.create(
            source_message=source_message, 
            target_message=target_message, 
            author=default_user,
            link_type=link_type
        )
        return redirect('post_message')  # Redirect to the main page

    return render(request, 'create_link.html')

