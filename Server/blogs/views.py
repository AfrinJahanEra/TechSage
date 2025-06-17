from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Blog
from users.models import User

from datetime import datetime
# ... other imports ...

class CreateBlog(APIView):
    def post(self, request):
        data = request.data
        author = User.objects(username=data.get('author')).first()
        
        if not author:
            return Response({"error": "Author not found"}, status=400)
            
        try:
            blog = Blog(
                title=data['title'],
                content=data['content'],
                author=author,
                created_at=datetime.utcnow()  # Explicitly set here
            )
            blog.save()
            return Response({
                "message": "Blog created successfully",
                "id": str(blog.id),
                "created_at": blog.created_at.isoformat()
            }, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class ListBlogs(APIView):
    def get(self, request):
        try:
            blogs = Blog.objects.all()  # Only queries existing fields
            blogs_list = []
            for blog in blogs:
                blog_data = {
                    "id": str(blog.id),
                    "title": blog.title,
                    "content": blog.content,
                    "author": {
                        "username": blog.author.username,
                        "email": blog.author.email
                    },
                    "created_at": blog.created_at.isoformat() if blog.created_at else None
                }
                blogs_list.append(blog_data)
            return Response(blogs_list)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
