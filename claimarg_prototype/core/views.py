import json

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from django.db import transaction
from django.views.decorators.http import require_http_methods

from .models import Link, Message


@login_required
def post_message(request):
    if request.method == 'POST':
        message_content = request.POST.get('content')
        message_type = request.POST.get('type')

        Message.objects.create(
            content=message_content,
            type=message_type,
            author=request.user
        )
        return redirect(reverse('post_message'))  # Redirect to a success page or home

    messages = Message.objects.all()  # Retrieve all messages for display
    links = Link.objects.all()  # Retrieve all messages for display
    return render(request, 'post_and_show_messages.html', {'messages': messages, 'links': links})


@login_required
@transaction.atomic
def add_message(request):
    if request.method == 'POST':
        message_content = request.POST.get('content')
        message_type = request.POST.get('type')
        link_type = request.POST.get('link_type')
        target_message_id = request.POST.get('target_message_id')  # Add this line

        # Create the message with the correct user
        new_message = Message.objects.create(
            content=message_content,
            type=message_type,
            author=request.user
        )

        try:
            # Retrieve the target message
            target_message = Message.objects.get(id=target_message_id)
        except Message.DoesNotExist:
            # Handle the case where the target message doesn't exist
            return JsonResponse({'error': 'Target message does not exist.'}, status=400)

        # Create the link with the target message
        Link.objects.create(
            source_message=new_message,
            target_message=target_message,
            link_type=link_type,
            author=request.user
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


@login_required
def create_link(request):
    if request.method == 'POST':
        source_id = request.POST.get('source_message')
        target_id = request.POST.get('target_message')
        link_type = request.POST.get('link_type')

        try:
            source_message = Message.objects.get(id=source_id)
            target_message = Message.objects.get(id=target_id)

            Link.objects.create(
                source_message=source_message,
                target_message=target_message,
                author=request.user,
                link_type=link_type
            )
            return redirect('post_message')  # Redirect to the main page

        except Message.DoesNotExist:
            # Handle the error appropriately or redirect with an error message
            return HttpResponse('Message not found', status=404)
        except Exception:
            # Log the exception and redirect with an error message
            return HttpResponse('An error occurred', status=500)


@login_required
@require_http_methods(["POST"])  # Ensure this view only accepts POST requests
def create_link_ajax(request):
    try:
        data = json.loads(request.body)
        source_id = data.get('source_message')
        target_id = data.get('target_message')
        link_type = data.get('link_type')

        source_message = Message.objects.get(id=source_id)
        target_message = Message.objects.get(id=target_id)

        Link.objects.create(
            source_message=source_message,
            target_message=target_message,
            author=request.user,
            link_type=link_type
        )
        return JsonResponse({"status": "success"})

    except Message.DoesNotExist:
        return JsonResponse({"error": "Message not found"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def graph_data(request):
    nodes = [{'id': message.id,
              'label': message.content,
              'author': message.author.username,
              'group': message.type} for message in Message.objects.all()]
    edges = [{'id': link.id,
              'from': link.source_message.id,
              'to': link.target_message.id if link.target_message
                    else "L" + str(link.target_link.id),
              'link_type': link.link_type} for link in Link.objects.all()]

    return JsonResponse({'nodes': nodes, 'edges': edges})


@login_required
def delete_link(request):
    if request.method == 'POST':
        link_id = request.POST.get('link_id')

        try:
            link = Link.objects.get(id=link_id)

            # Check if the logged-in user is the author of the link
            if link.author != request.user:
                return HttpResponse('You do not have permission to delete this link.', status=403)

            link.delete()
            return HttpResponseRedirect(reverse('post_message'))  # Redirect to the main page

        except Link.DoesNotExist:
            return HttpResponse('Link not found.', status=404)

    # If it's not a POST request or any other issue, redirect to a safe page
    return HttpResponseRedirect(reverse('post_message'))


@login_required
def delete_message(request):
    if request.method == 'POST':
        if request.content_type == 'application/json':
            try:
                # Handle AJAX request
                data = json.loads(request.body)
                message_id = data.get('message_id')
                message = Message.objects.get(id=message_id)
                if message.author != request.user:
                    return JsonResponse(
                        {'error': 'You do not have permission to delete this message.'}, status=403)
                message.delete()
                return JsonResponse({'status': 'success'})
            except Message.DoesNotExist:
                return JsonResponse({'error': 'Message not found.'}, status=404)
        else:
            try:
                # Handle regular form submission
                message_id = request.POST.get('message_id')
                message = Message.objects.get(id=message_id)
                if message.author != request.user:
                    return HttpResponse(
                        'You do not have permission to delete this message.',
                        status=403)
                return HttpResponseRedirect(reverse('post_message'))
            except Message.DoesNotExist:
                return HttpResponse('Message not found.', status=404)
    return JsonResponse({'error': 'Invalid request method.'}, status=400)  # not a POST request


@login_required
@transaction.atomic
@require_http_methods(["POST"])
def add_message_and_link_to_link(request):
    try:
        # Extract data from request
        data = json.loads(request.body)
        content = data['content']
        message_type = data['type']
        link_type = data['link_type']
        link_id = data['link_id']

        # Create the message
        new_message = Message.objects.create(
            content=content,
            type=message_type,
            author=request.user
        )

        # Associate message with the link
        target_link = Link.objects.get(id=link_id)
        Link.objects.create(
            source_message=new_message,
            target_link=target_link,
            author=request.user,
            link_type=link_type
        )

        return JsonResponse({'status': 'success', 'message_id': new_message.id})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
