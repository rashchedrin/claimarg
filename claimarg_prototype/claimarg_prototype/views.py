from django.shortcuts import render
from django.contrib.auth.decorators import login_required


def home(request):
    email = request.user.email if request.user.is_authenticated else 'guest'
    return render(request, 'home.html', {'email': email})