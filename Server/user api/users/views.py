from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from bson.objectid import ObjectId
from .serializers import UserSerializer
import hashlib

# MongoDB collection
users_col = settings.MONGO_DB["users"]

# Utility function to hash passwords
def hash_pw(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Register User
class RegisterUser(APIView):
    def post(self, request):
        data = request.data.copy()
        data['password'] = hash_pw(data['password'])
        inserted = users_col.insert_one(data)
        return Response({'id': str(inserted.inserted_id)}, status=201)

# Get User by ID
class GetUser(APIView):
    def get(self, request, user_id):
        user = users_col.find_one({'_id': ObjectId(user_id)})
        if not user:
            return Response({'error': 'User not found'}, status=404)
        user['id'] = str(user['_id'])
        del user['_id'], user['password']
        return Response(user)

# Update User by ID
class UpdateUser(APIView):
    def patch(self, request, user_id):
        update_fields = request.data
        if 'password' in update_fields:
            update_fields['password'] = hash_pw(update_fields['password'])
        result = users_col.update_one({'_id': ObjectId(user_id)}, {'$set': update_fields})
        if result.matched_count == 0:
            return Response({'error': 'User not found'}, status=404)
        return Response({'message': 'User updated'})

# Delete User by ID
class DeleteUser(APIView):
    def delete(self, request, user_id):
        result = users_col.delete_one({'_id': ObjectId(user_id)})
        if result.deleted_count == 0:
            return Response({'error': 'User not found'}, status=404)
        return Response({'message': 'User deleted'})

# Login User
class LoginUser(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = hash_pw(request.data.get('password'))
        user = users_col.find_one({'email': email, 'password': password})
        if not user:
            return Response({'error': 'Invalid credentials'}, status=401)
        return Response({'message': 'Login successful', 'id': str(user['_id'])})
