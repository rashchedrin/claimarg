import json

from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.urls import reverse
from .models import Link, Message
from django.http import HttpResponseRedirect, JsonResponse
from django.db import transaction


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


@transaction.atomic
def add_message(request):
    if request.method == 'POST':
        message_content = request.POST.get('content')
        message_type = request.POST.get('type')
        link_type = request.POST.get('link_type')
        target_message_id = request.POST.get('target_message_id')  # Add this line

        try:
            # Retrieve the default user
            default_user = User.objects.get(username='default')
        except User.DoesNotExist:
            # Handle the case where the default user doesn't exist
            return JsonResponse({'error': 'Default user does not exist. Please create the default user.'}, status=500)

        # Create the message with the correct user
        new_message = Message.objects.create(
            content=message_content,
            type=message_type,
            author=default_user
        )

        try:
            # Retrieve the target message
            target_message = Message.objects.get(id=target_message_id)
        except Message.DoesNotExist:
            # Handle the case where the target message doesn't exist
            return JsonResponse({'error': 'Target message does not exist.'}, status=400)

        # Create the link with the target message
        link = Link.objects.create(
            source_message=new_message,
            target_message=target_message,
            link_type=link_type,
            author=default_user
        )

        # Return the new message ID in the JSON response
        return JsonResponse({'message_id': new_message.id})

    # Handle GET requests or other cases
    return JsonResponse({'error': 'Invalid request method.'}, status=400)


def success(request):
    return render(request, 'success.html')


def show_messages(request):
    messages = Message.objects.all()  # Retrieve all messages
    return render(request, 'show_messages.html', {'messages': messages})


def create_link(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        source_id = data.get('source_message')
        target_id = data.get('target_message')

        try:
            source_message = Message.objects.get(id=source_id)
            target_message = Message.objects.get(id=target_id)
            default_user = User.objects.get(username='default')
            link_type = data.get('link_type')

            Link.objects.create(
                source_message=source_message, 
                target_message=target_message, 
                author=default_user,
                link_type=link_type
            )
            return redirect('post_message') 
        except Message.DoesNotExist:
            return JsonResponse({"error": "Message not found"}, status=404)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    # GET request or other methods
    return render(request, 'create_link.html')


def graph_data(request):
    nodes = [{'id': message.id, 
              'label': message.content, 
              'group': message.type} for message in Message.objects.all()]
    edges = [{'from': link.source_message.id, 
              'to': link.target_message.id, 
              'link_type': link.link_type} for link in Link.objects.all()]
    
    return JsonResponse({'nodes': nodes, 'edges': edges})


def delete_link(request):
    if request.method == 'POST':
        link_id = request.POST.get('link_id')
        Link.objects.filter(id=link_id).delete()
        return HttpResponseRedirect(reverse('post_message'))
    # Redirect to home or an appropriate page if not a POST request
    return HttpResponseRedirect(reverse('post_message'))


def delete_message(request):
    if request.method == 'POST':
        if request.content_type == 'application/json':
            # Handle AJAX request
            data = json.loads(request.body)
            message_id = data.get('message_id')
            Message.objects.filter(id=message_id).delete()
            return JsonResponse({'status': 'success'})
        else:
            # Handle regular form submission
            message_id = request.POST.get('message_id')
            Message.objects.filter(id=message_id).delete()
            return HttpResponseRedirect(reverse('post_message'))

    return HttpResponseRedirect(reverse('post_message'))
