from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Blog
from users.models import User
from datetime import datetime

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
        blogs = Blog.objects(is_deleted=False)
        # blogs = Blog.objects.all()
        blogs_list = []
        for blog in blogs:
            blog_data = {
                "id": str(blog.id),
                "title": blog.title,
                "content": blog.content,
                "author": blog.author.username,
                "created_at": blog.created_at.isoformat(),
                "current_version": blog.current_version,
                "version_count": len(blog.versions) if blog.versions else 0
            }
            blogs_list.append(blog_data)
        return Response(blogs_list)
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Blog
from users.models import User

class UpdateBlog(APIView):
    def put(self, request, blog_id):
        data = request.data
        try:
            blog = Blog.objects.get(id=blog_id)
            username = data.get('username')  # Get username from request
            
            if not username:
                return Response({"error": "username is required"}, status=400)
                
            # Verify user exists
            if not User.objects(username=username).first():
                return Response({"error": "User not found"}, status=404)
            
            # Save current version before updating
            blog.save_version(username)
            
            # Update blog content
            blog.title = data.get('title', blog.title)
            blog.content = data.get('content', blog.content)
            blog.save()
            
            return Response({
                "message": "Blog updated successfully",
                "version": blog.current_version,
                "new_title": blog.title,
                "new_content": blog.content
            })
            
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

# blogs/views.py
class GetBlogVersions(APIView):
    def get(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            
            # Prepare version history
            versions = []
            for idx, version in enumerate(blog.versions, 1):
                versions.append({
                    "version": idx,
                    "title": version.title,
                    "content": version.content,
                    "updated_at": version.updated_at.isoformat(),
                    "updated_by": version.updated_by
                })
            
            # Include current version as version 0
            current_version = {
                "version": "current",
                "title": blog.title,
                "content": blog.content,
                "updated_at": datetime.utcnow().isoformat(),
                "updated_by": "N/A"
            }
            
            return Response({
                "blog_id": str(blog.id),
                "current_version": blog.current_version,
                "content": {
                    "current": current_version,
                    "history": versions
                }
            })
            
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)
        
# blogs/views.py
class RevertBlogVersion(APIView):
    def post(self, request, blog_id, version_number):
        try:
            blog = Blog.objects.get(id=blog_id)
            username = request.data.get('username')
            
            if not username:
                return Response({"error": "username is required"}, status=400)
                
            if blog.revert_to_version(version_number, username):
                return Response({
                    "message": f"Reverted to version {version_number}",
                    "new_version": blog.current_version,
                    "current_title": blog.title,
                    "current_content": blog.content
                })
            else:
                return Response({"error": "Invalid version number"}, status=400)
                
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)
        
# blogs/views.py
class DeleteBlog(APIView):
    def delete(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            username = request.data.get('username')
            
            if not username:
                return Response({"error": "username required"}, status=400)
                
            # Verify ownership (add your ownership logic)
            if str(blog.author.username) != username:
                return Response({"error": "You can only delete your own blogs"}, status=403)
            
            # Soft delete (recommended)
            blog.soft_delete(username)
            
            return Response({
                "message": "Blog marked as deleted",
                "deleted_at": blog.deleted_at.isoformat()
            })
            
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)

class ModeratorDeleteBlog(APIView):
    def delete(self, request, blog_id):
        """Permanent deletion (admin only)"""
        blog = Blog.objects.get(id=blog_id)
        blog.hard_delete()
        return Response({"message": "Blog permanently deleted"})
