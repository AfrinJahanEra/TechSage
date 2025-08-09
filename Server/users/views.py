from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from .models import User
import cloudinary
import os
from dotenv import load_dotenv
from reports.models import BlogReport
from datetime import datetime
from mongoengine.queryset.visitor import Q
from blogs.models import Blog
from comments.models import Comment

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)



class UserListByRole(APIView):
    def get(self, request):
        role = request.GET.get('role', '').strip().lower()
        if not role:
            return Response({"error": "Role parameter is required"}, status=400)
        try:
            users = User.objects(role=role)
            return Response([user.to_json() for user in users])
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class DeleteUserAccount(APIView):
    def delete(self, request, username):
        try:
            req_username = request.data.get('username')
            req_password = request.data.get('password')
            
            if not req_username:
                return Response({"error": "Username is required"}, status=400)
                
            requesting_user = User.objects(username=req_username).first()
            if not requesting_user:
                return Response({"error": "Requesting user not found"}, status=404)

            target_user = User.objects(username=username).first()
            if not target_user:
                return Response({"error": "Target user not found"}, status=404)

            # Authorization check
            if requesting_user.role != 'admin':
                if req_username != username:
                    return Response({"error": "You can only delete your own account"}, status=403)
                if not req_password:
                    return Response({"error": "Password required"}, status=400)
                if not check_password(req_password, requesting_user.password):
                    return Response({"error": "Incorrect password"}, status=401)

            # Delete all blogs where user is the sole author
            user_blogs = Blog.objects(authors__in=[target_user])
            for blog in user_blogs:
                if len(blog.authors) == 1:  # User is the only author
                    # Delete all comments on this blog first
                    Comment.objects(blog=blog).delete()
                    # Delete all reports on this blog
                    BlogReport.objects(blog=blog).delete()
                    # Delete the blog
                    blog.delete()
                else:
                    # Remove user from authors list if there are other authors
                    blog.authors.remove(target_user)
                    blog.save()

            # Delete all comments by this user
            Comment.objects(author=target_user).delete()
            
            # Delete all reports by this user
            BlogReport.objects(reported_by=target_user).delete()
            
            # Delete all reports targeting this user's blogs
            BlogReport.objects(blog__authors__in=[target_user]).delete()
            
            # Finally delete the user
            target_user.delete()
            
            return Response({
                "message": f"User '{username}' and all associated data deleted successfully",
                "deleted_blogs": user_blogs.count(),
                "deleted_comments": Comment.objects(author=target_user).count(),
                "deleted_reports": BlogReport.objects(Q(reported_by=target_user) | Q(blog__authors__in=[target_user])).count()
            }, status=200)
            
        except Exception as e:
            return Response({"error": str(e)}, status=500)




class AllUsersView(APIView):
    def get(self, request):
        try:
            users = User.objects.all()
            user_data = []
            for user in users:
                published_blogs = Blog.objects(
                    authors__in=[user],
                    is_published=True,
                    is_deleted=False
                ).count()
                user_comments = Comment.objects(
                    author=user,
                    is_deleted=False
                ).count()
                blog_likes = Blog.objects(authors__in=[user]).aggregate([
                    {
                        '$project': {
                            'likes_count': { '$size': '$upvotes' }
                        }
                    },
                    {
                        '$group': {
                            '_id': None,
                            'total_likes': { '$sum': '$likes_count' }
                        }
                    }
                ])
                blog_likes = next(blog_likes, {}).get('total_likes', 0)
                blog_reports = BlogReport.objects.aggregate([
                    {
                        '$lookup': {
                            'from': 'blogs',
                            'localField': 'blog',
                            'foreignField': '_id',
                            'as': 'blog_data'
                        }
                    },
                    {
                        '$unwind': '$blog_data'
                    },
                    {
                        '$match': {
                            'blog_data.authors': user.id
                        }
                    },
                    {
                        '$count': 'total_reports'
                    }
                ])
                blog_reports = next(blog_reports, {}).get('total_reports', 0)
                points = max(
                    (published_blogs * 10) + 
                    (user_comments * 5) + 
                    (blog_likes * 2) - 
                    (blog_reports * 3),
                    0
                )
                user_data.append({
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "job_title": user.job_title,
                    "avatar_url": user.avatar_url,
                    "created_at": user.created_at.isoformat(),
                    "points": points,
                    "published_blogs": published_blogs,
                    "comments": user_comments,
                    "likes": blog_likes,
                    "reports": blog_reports
                })
            return Response({"users": user_data}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)




class RegisterUser(APIView):
    def post(self, request):
        required_fields = ['username', 'email', 'password']
        if not all(field in request.data for field in required_fields):
            return Response({"error": "Missing required fields"}, status=400)
        try:
            if User.objects(username=request.data['username']).first():
                return Response({"error": "Username already exists"}, status=400)
            if User.objects(email=request.data['email']).first():
                return Response({"error": "Email already exists"}, status=400)

            avatar_url = None
            avatar_public_id = None
            if 'avatar' in request.FILES:
                upload_result = cloudinary.uploader.upload(
                    request.FILES['avatar'],
                    folder="techsage/avatars",
                    allowed_formats=['jpg', 'png', 'jpeg']
                )
                avatar_url = upload_result['secure_url']
                avatar_public_id = upload_result['public_id']

            user = User(
                username=request.data['username'],
                email=request.data['email'],
                password=make_password(request.data['password']),
                avatar_url=avatar_url,
                avatar_public_id=avatar_public_id,
                university=request.data.get('university', ''),
                job_title=request.data.get('job_title', 'User'),
                bio=request.data.get('bio', ''),
                role=request.data.get('role', 'user'),
                source=request.data.get('source', 'email')
            )
            user.clean()
            user.save()

            return Response(user.to_json(), status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)



class LoginUser(APIView):
    def post(self, request):
        if 'username' not in request.data or 'password' not in request.data:
            return Response({"error": "Username and password required"}, status=400)

        try:
            user = User.objects(username=request.data['username']).first()
            if not user or not check_password(request.data['password'], user.password):
                return Response({"error": "Invalid credentials"}, status=401)

            return Response(user.to_json())

        except Exception as e:
            return Response({"error": str(e)}, status=500)



class UserProfile(APIView):
    def get(self, request, username):
        try:
            user = User.objects(username=username).first()
            if not user:
                return Response({"error": "User not found"}, status=404)
            return Response(user.to_json())
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request, username):
        try:
            user = User.objects(username=username).first()
            if not user:
                return Response({"error": "User not found"}, status=404)

            if 'avatar' in request.FILES:
                if not user.upload_avatar(request.FILES['avatar']):
                    return Response({"error": "Failed to upload avatar"}, status=400)

            update_fields = ['bio', 'job_title', 'university']
            for field in update_fields:
                if field in request.data:
                    setattr(user, field, request.data[field])

            user.updated_at = datetime.now()
            user.save()

            return Response(user.to_json())

        except Exception as e:
            return Response({"error": str(e)}, status=500)



class UserSearch(APIView):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query or len(query) < 3:
            return Response({"error": "Search query must be at least 3 characters"}, status=400)

        try:
            users = User.objects.filter(username__icontains=query).limit(5)
            return Response([user.to_json() for user in users])
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class SavedBlogsAPI(APIView):
    def post(self, request, username):
        try:
            user = User.objects(username=username).first()
            if not user:
                return Response({"error": "User not found"}, status=404)

            blog_id = request.data.get('blog_id')
            if not blog_id:
                return Response({"error": "blog_id required"}, status=400)

            if blog_id not in user.saved_blogs:
                user.saved_blogs.append(blog_id)
                user.save()

            return Response(user.to_json())

        except Exception as e:
            return Response({"error": str(e)}, status=500)


    def delete(self, request, username):
        try:
            user = User.objects(username=username).first()
            if not user:
                return Response({"error": "User not found"}, status=404)

            blog_id = request.data.get('blog_id')
            if not blog_id:
                return Response({"error": "blog_id required"}, status=400)

            if blog_id in user.saved_blogs:
                user.saved_blogs.remove(blog_id)
                user.save()

            return Response(user.to_json())

        except Exception as e:
            return Response({"error": str(e)}, status=500)
