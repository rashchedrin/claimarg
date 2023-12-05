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
        return redirect(reverse('success'))  # Redirect to a success page or home

    return render(request, 'post_message.html')  # Render the form template


def success(request):
    return render(request, 'success.html')
