from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from django.contrib.auth.hashers import make_password, check_password
import cloudinary.uploader

class RegisterUser(APIView):
    def post(self, request):
        data = request.data
        if User.objects(username=data['username']).first():
            return Response({"error": "Username already exists"}, status=400)
        if User.objects(email=data['email']).first():
            return Response({"error": "Email already exists"}, status=400)
            
        # Handle avatar upload
        avatar_url = None
        if 'avatar' in data:
            upload_result = cloudinary.uploader.upload(data['avatar'])
            avatar_url = upload_result['secure_url']
            
        user = User(
            username=data['username'],
            email=data['email'],
            password=make_password(data['password']),
            avatar_url=avatar_url,
            university=data.get('university'),
            role=data.get('role', 'user')
        ).save()
        return Response(user.to_json(), status=201)

class LoginUser(APIView):
    def post(self, request):
        data = request.data
        user = User.objects(username=data['username']).first()
        if user and check_password(data['password'], user.password):
            return Response(user.to_json())
        return Response({"error": "Invalid credentials"}, status=400)

class GetUser(APIView):
    def get(self, request, username):
        user = User.objects(username=username).first()
        if user:
            return Response(user.to_json())
        return Response({"error": "User not found"}, status=404)
    
    from rest_framework.pagination import PageNumberPagination

class UserSearch(APIView):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response({"error": "Search query 'q' parameter required"}, status=400)
            
        users = User.objects.filter(username__icontains=query)
        return Response([{
            "id": str(user.id),
            "username": user.username,
            "email": user.email
        } for user in users])