from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Blog
from users.models import User

class CreateBlog(APIView):
    def post(self, request):
        user = User.objects(id=request.data["author_id"]).first()
        if not user:
            return Response({"error": "User not found"}, status=404)

        blog = Blog(
            title=request.data["title"],
            content=request.data["content"],
            author=user,
            category=request.data.get("category", "General")
        ).save()
        return Response({"message": "Blog created"}, status=201)

class ListBlogs(APIView):
    def get(self, request):
        blogs = Blog.objects(status="Published")
        return Response([blog.to_json() for blog in blogs])
