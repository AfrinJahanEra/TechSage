from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Blog
from users.models import User
from datetime import datetime
import cloudinary.uploader

class CreateBlog(APIView):
    def post(self, request):
        data = request.data
        author = User.objects(username=data.get('author')).first()
        
        if not author:
            return Response({"error": "Author not found"}, status=400)
            
        try:
            thumbnail_url = None
            if 'thumbnail' in data:
                upload_result = cloudinary.uploader.upload(data['thumbnail'])
                thumbnail_url = upload_result['secure_url']
            
            blog = Blog(
                title=data['title'],
                content=data['content'],
                author=author,
                thumbnail_url=thumbnail_url,
                categories=data.get('categories', []),
                tags=data.get('tags', []),
                created_at=datetime.utcnow()
            )
            blog.save()
            return Response({
                "message": "Blog created successfully",
                "id": str(blog.id),
                "created_at": blog.created_at.isoformat(),
                "thumbnail_url": blog.thumbnail_url
            }, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class ListBlogs(APIView):
    def get(self, request):
        blogs = Blog.objects(is_deleted=False)
        blogs_list = []
        for blog in blogs:
            blog_data = {
                "id": str(blog.id),
                "title": blog.title,
                "content": blog.content,
                "thumbnail_url": blog.thumbnail_url,
                "author": blog.author.username,
                "categories": blog.categories,
                "tags": blog.tags,
                "created_at": blog.created_at.isoformat(),
                "updated_at": blog.updated_at.isoformat(),
                "upvotes": len(blog.upvotes),
                "downvotes": len(blog.downvotes),
                "current_version": blog.current_version
            }
            blogs_list.append(blog_data)
        return Response(blogs_list)

class GetBlog(APIView):
    def get(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id, is_deleted=False)
            return Response({
                "id": str(blog.id),
                "title": blog.title,
                "content": blog.content,
                "thumbnail_url": blog.thumbnail_url,
                "author": {
                    "username": blog.author.username,
                    "avatar": blog.author.avatar_url if hasattr(blog.author, 'avatar_url') else None
                },
                "categories": blog.categories,
                "tags": blog.tags,
                "created_at": blog.created_at.isoformat(),
                "updated_at": blog.updated_at.isoformat(),
                "upvotes": len(blog.upvotes),
                "downvotes": len(blog.downvotes)
            })
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)

class UpdateBlog(APIView):
    def put(self, request, blog_id):
        data = request.data
        try:
            blog = Blog.objects.get(id=blog_id)
            username = data.get('username')
            
            if not username:
                return Response({"error": "username is required"}, status=400)
                
            if not User.objects(username=username).first():
                return Response({"error": "User not found"}, status=404)
            
            blog.save_version(username)
            
            if 'thumbnail' in data:
                if blog.thumbnail_url:
                    public_id = blog.thumbnail_url.split('/')[-1].split('.')[0]
                    cloudinary.uploader.destroy(public_id)
                upload_result = cloudinary.uploader.upload(data['thumbnail'])
                blog.thumbnail_url = upload_result['secure_url']
            
            blog.title = data.get('title', blog.title)
            blog.content = data.get('content', blog.content)
            blog.categories = data.get('categories', blog.categories)
            blog.tags = data.get('tags', blog.tags)
            blog.updated_at = datetime.utcnow()
            blog.save()
            
            return Response({
                "message": "Blog updated successfully",
                "version": blog.current_version,
                "thumbnail_url": blog.thumbnail_url
            })
            
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class GetBlogVersions(APIView):
    def get(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            versions = []
            for idx, version in enumerate(blog.versions, 1):
                versions.append({
                    "version": idx,
                    "title": version.title,
                    "content": version.content,
                    "updated_at": version.updated_at.isoformat(),
                    "updated_by": version.updated_by
                })
            return Response({
                "blog_id": str(blog.id),
                "current_version": blog.current_version,
                "versions": versions
            })
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)

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
                    "new_version": blog.current_version
                })
            else:
                return Response({"error": "Invalid version number"}, status=400)
                
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)

class DeleteBlog(APIView):
    def delete(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            username = request.data.get('username')
            
            if not username:
                return Response({"error": "username required"}, status=400)
                
            if str(blog.author.username) != username:
                return Response({"error": "You can only delete your own blogs"}, status=403)
            
            blog.soft_delete(username)
            
            return Response({
                "message": "Blog marked as deleted",
                "deleted_at": blog.deleted_at.isoformat()
            })
            
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)

class ModeratorDeleteBlog(APIView):
    def delete(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            blog.hard_delete()
            return Response({"message": "Blog permanently deleted"})
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)

class VoteBlog(APIView):
    def post(self, request, blog_id):
        data = request.data
        try:
            blog = Blog.objects.get(id=blog_id)
            user = User.objects(username=data.get('username')).first()
            
            if not user:
                return Response({"error": "User not found"}, status=404)
                
            vote_type = data.get('type')
            
            if vote_type == 'upvote':
                if user in blog.upvotes:
                    blog.upvotes.remove(user)
                else:
                    blog.upvotes.append(user)
                    if user in blog.downvotes:
                        blog.downvotes.remove(user)
            elif vote_type == 'downvote':
                if user in blog.downvotes:
                    blog.downvotes.remove(user)
                else:
                    blog.downvotes.append(user)
                    if user in blog.upvotes:
                        blog.upvotes.remove(user)
            else:
                return Response({"error": "Invalid vote type"}, status=400)
                
            blog.save()
            return Response({
                "upvotes": len(blog.upvotes),
                "downvotes": len(blog.downvotes)
            })
            
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)

class BlogSearch(APIView):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response({"error": "Search query 'q' parameter required"}, status=400)
            
        try:
            from mongoengine.queryset.visitor import Q
            
            # Get the full blog documents that match the search
            blogs = Blog.objects(
                Q(title__icontains=query) |
                Q(content__icontains=query) |
                Q(tags__icontains=query) |
                Q(categories__icontains=query),
                is_deleted=False
            )
            
            results = []
            for blog in blogs:
                results.append({
                    "id": str(blog.id),
                    "title": blog.title,
                    "author": blog.author.username,
                    "excerpt": blog.content[:100] + "..." if len(blog.content) > 100 else blog.content,
                    "categories": blog.categories,
                    "tags": blog.tags,
                    "thumbnail_url": blog.thumbnail_url
                })
            
            return Response(results)
            
        except Exception as e:
            return Response({"error": str(e)}, status=500)