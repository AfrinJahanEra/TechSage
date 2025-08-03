from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from mongoengine import DoesNotExist
from blogs.models import Blog
from users.models import User
from .models import VersionedBlog

class SaveVersion(APIView):
    """Save current state as a new version"""
    def post(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            username = request.data.get('username')
            
            if not username:
                return Response({"error": "username required"}, status=status.HTTP_400_BAD_REQUEST)
            
            user = User.objects.get(username=username)
            
 
            if user not in blog.authors:
                blog.authors.append(user)
                blog.save()
            
 
            versioned_blog, _ = VersionedBlog.objects.get_or_create(blog=blog)
            versioned_blog.save_version(user)
            
            return Response({
                "message": "Version saved",
                "version": versioned_blog.current_version,
                "authors": [u.username for u in blog.authors]
            })
            
        except (Blog.DoesNotExist, User.DoesNotExist):
            return Response({"error": "Blog or User not found"}, status=status.HTTP_404_NOT_FOUND)

class RevertToVersion(APIView):
    """Revert blog to a previous version"""
    def post(self, request, blog_id, version_number):
        try:
            blog = Blog.objects.get(id=blog_id)
            username = request.data.get('username')
            
            if not username:
                return Response({"error": "username required"}, status=status.HTTP_400_BAD_REQUEST)
                
            user = User.objects.get(username=username)
            versioned_blog = VersionedBlog.objects.get(blog=blog)
            
            if versioned_blog.revert_to_version(version_number, user):
                return Response({
                    "message": f"Reverted to version {version_number}",
                    "current_version": versioned_blog.current_version
                })
            else:
                return Response({"error": "Invalid version number"}, status=status.HTTP_400_BAD_REQUEST)
                
        except (Blog.DoesNotExist, User.DoesNotExist):
            return Response({"error": "Blog or User not found"}, status=status.HTTP_404_NOT_FOUND)
        except VersionedBlog.DoesNotExist:
            return Response({"error": "No versions exist for this blog"}, status=status.HTTP_404_NOT_FOUND)

class ListVersions(APIView):
    """List all versions of a blog"""
    def get(self, request, blog_id):
        try:
            versioned_blog = VersionedBlog.objects.get(blog__id=blog_id)
            versions = []
            
            for idx, version in enumerate(versioned_blog.versions, 1):
                versions.append({
                    "version": idx,
                    "title": version.title,
                    "updated_at": version.updated_at.isoformat(),
                    "updated_by": version.updated_by,
                    "author": {
                        "username": version.author.username,
                        "avatar": getattr(version.author, 'avatar_url', None)
                    }
                })
            
            return Response({
                "blog_id": str(blog_id),
                "current_version": versioned_blog.current_version,
                "versions": versions
            })
            
        except VersionedBlog.DoesNotExist:
            return Response({"error": "No versions exist for this blog"}, status=status.HTTP_404_NOT_FOUND)