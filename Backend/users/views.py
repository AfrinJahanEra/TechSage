from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from django.contrib.auth.hashers import make_password, check_password

class RegisterUser(APIView):
    def post(self, request):
        data = request.data
        if User.objects(username=data['username']):
            return Response({"error": "Username already exists"}, status=400)
        user = User(
            username=data['username'],
            email=data['email'],
            password=make_password(data['password']),
        ).save()
        return Response({"message": "User registered successfully"}, status=201)

class LoginUser(APIView):
    def post(self, request):
        data = request.data
        user = User.objects(username=data['username']).first()
        if user and check_password(data['password'], user.password):
            return Response(user.to_json())
        return Response({"error": "Invalid credentials"}, status=400)

from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.utils.html import escape
import json
from .models import User
from django.contrib.auth.hashers import make_password

@csrf_exempt
def register_form(request):
    if request.method == 'POST':
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = make_password(request.POST.get("password"))
        if User.objects(username=username):
            return HttpResponse("Username already exists")
        User(username=username, email=email, password=password).save()
        return HttpResponse("User registered successfully")

    return HttpResponse("""
    <h2>Register User</h2>
    <form method="post">
        <label>Username: <input name="username"></label><br><br>
        <label>Email: <input name="email" type="email"></label><br><br>
        <label>Password: <input name="password" type="password"></label><br><br>
        <button type="submit">Register</button>
    </form>
    """)
