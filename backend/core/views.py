from django.shortcuts import render

from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from .models import User
import json




@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Email already exists'}, status=400)

        hashed_password = make_password(password)
        user = User.objects.create(email=email, password=hashed_password)
        return JsonResponse({'message': 'User registered successfully'}, status=201)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        try:
            user = User.objects.get(email=email)
            if check_password(password, user.password):
                return JsonResponse({'message': 'Login successful', 'user_id': user.id, 'name': user.name}, status=200)
            else:
                return JsonResponse({'message': 'Invalid password'}, status=400)
        except User.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

def index(request):
    return HttpResponse("Welcome to the Online Judge Home Page")