from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.urls import reverse
from .models import Message

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
    return render(request, 'post_and_show_messages.html', {'messages': messages})


def success(request):
    return render(request, 'success.html')


def show_messages(request):
    messages = Message.objects.all()  # Retrieve all messages
    return render(request, 'show_messages.html', {'messages': messages})
