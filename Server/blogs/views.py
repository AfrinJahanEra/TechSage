from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from mongoengine import ValidationError
from django.shortcuts import render
import cloudinary.uploader
from .models import Blog
from .models import Vote
from users.models import User
from comments.models import Comment
import pytz
from django.core.paginator import Paginator, EmptyPage
from rest_framework import status
from mongoengine import DoesNotExist, NotUniqueError
from reports.models import BlogReport
from django.utils import timezone
import mongoengine

def blog_test_view(request):
    return render(request, "blog_update_test.html")

class CreateBlog(APIView):
    def post(self, request):
        data = request.data
        username = data.get('username')

        if not username:
            return Response({"error": "username is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not data.get('title'):
            return Response({"error": "title is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not data.get('content'):
            return Response({"error": "content is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
            categories = data.getlist('categories[]', [])
            tags = data.getlist('tags[]', [])
            
            thumbnail_url = None
            if 'thumbnail' in request.FILES:
                upload_result = cloudinary.uploader.upload(request.FILES['thumbnail'])
                thumbnail_url = upload_result['secure_url']
            
            is_draft = str(data.get('is_draft', 'true')).lower() == 'true'
            is_deleted = str(data.get('is_deleted', 'false')).lower() == 'true'
            
            blog = Blog(
                title=data['title'],
                content=data['content'],
                authors=[user],
                thumbnail_url=thumbnail_url,
                categories=categories,
                tags=tags,
                is_draft=False,
                is_deleted=False,
                is_published=True,
                is_reviewed=False,
                reviewed_by=None  
            )
            
            if not is_draft:
                blog.publish(username)
            
            blog.save()
            
            dhaka_tz = pytz.timezone('Asia/Dhaka')  # Define Asia/Dhaka timezone
            created_at_dhaka = blog.created_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)  # Convert to Asia/Dhaka
            
            response_data = {
                "id": str(blog.id),
                "title": blog.title,
                "status": "draft" if blog.is_draft else "published",
                "is_deleted": blog.is_deleted,
                "thumbnail_url": blog.thumbnail_url,
                "categories": blog.categories,
                "tags": blog.tags,
                "created_at": created_at_dhaka.isoformat(),
                "version": blog.current_version,
                "timezone": "Asia/Dhaka (UTC+6)"  # Indicate timezone
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except cloudinary.exceptions.Error as e:
            return Response({"error": f"Image upload failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListBlogs(APIView):
    def get(self, request):
        dhaka_tz = pytz.timezone('Asia/Dhaka')
        status_filter = request.GET.get('status', None)
        author_filter = request.GET.get('author', None) 
        category_filter = request.GET.get('category', None)

        query = Blog.objects.all()
        
        if status_filter == 'draft':
            query = query.filter(is_draft=True, is_published=False, is_deleted=False)
        elif status_filter == 'published':
            query = query.filter(is_published=True, is_deleted=False)
        elif status_filter == 'trash':
            query = query.filter(is_deleted=True)
        else: 
            query = query.filter(is_deleted=False)
        
        if author_filter:
            try:
                author = User.objects.get(username=author_filter)
                query = query.filter(authors__in=[author]) 
            except User.DoesNotExist:
                return Response({"error": "Author not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if category_filter:
            query = query.filter(categories__in=[category_filter])
        
        try:
            blogs = query.order_by('-created_at')
            blogs_list = []
            for blog in blogs:
                created_at_dhaka = blog.created_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)
                updated_at_dhaka = blog.updated_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)
                published_at_dhaka = blog.published_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz) if blog.published_at else None
                
                blog_data = {
                    "id": str(blog.id),
                    "title": blog.title,
                    "content": blog.content,
                    "authors": [{
                        "username": author.username,
                        "avatar": getattr(author, 'avatar_url', None)
                    } for author in blog.authors],
                    "thumbnail_url": blog.thumbnail_url,
                    "categories": blog.categories,
                    "tags": blog.tags,
                    "created_at": created_at_dhaka.isoformat(),
                    "updated_at": updated_at_dhaka.isoformat(),
                    "status": "draft" if blog.is_draft else "published" if blog.is_published else "deleted",
                    "stats": {
                        "upvotes": len(blog.upvotes),
                        "downvotes": len(blog.downvotes)
                    },
                    "version": blog.current_version,
                    "published_at": published_at_dhaka.isoformat() if published_at_dhaka else None,
                    "timezone": "Asia/Dhaka (UTC+6)"
                }
                blogs_list.append(blog_data)
            
            return Response({
                "count": len(blogs_list),
                "results": blogs_list
            })
            
        except Exception as e:
            return Response({
                "error": "Failed to fetch blogs",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class JobBlogs(APIView):
    def get(self, request):
        dhaka_tz = pytz.timezone('Asia/Dhaka')
        try:
            blogs = Blog.objects(
                categories__in=["job"],
                is_published=True,
                is_deleted=False
            ).order_by('-created_at')
            
            blogs_list = []
            for blog in blogs:
                created_at_dhaka = blog.created_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)
                updated_at_dhaka = blog.updated_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)
                
                blog_data = {
                    "id": str(blog.id),
                    "title": blog.title,
                    "content": blog.content,
                    "authors": [{
                        "username": author.username,
                        "avatar": getattr(author, 'avatar_url', None)
                    } for author in blog.authors],
                    "thumbnail_url": blog.thumbnail_url,
                    "tags": blog.tags,
                    "created_at": created_at_dhaka.isoformat(),
                    "updated_at": updated_at_dhaka.isoformat(),
                    "timezone": "Asia/Dhaka (UTC+6)"
                }
                blogs_list.append(blog_data)
            
            return Response({
                "count": len(blogs_list),
                "results": blogs_list
            })
            
        except Exception as e:
            return Response({
                "error": "Failed to fetch job blogs",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateBlog(APIView):
    def put(self, request, blog_id):
        data = request.data
        try:
            blog = Blog.objects.get(id=blog_id, is_deleted=False)
            username = data.get('username')
            
            if not username:
                return Response({"error": "username is required"}, status=status.HTTP_400_BAD_REQUEST)
                
            user = User.objects(username=username).first()
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            if user not in blog.authors:
                return Response({"error": "You are not authorized to edit this blog"}, 
                               status=status.HTTP_403_FORBIDDEN)
            
            blog.save_version(username)
            
            if 'thumbnail' in request.FILES:
                if blog.thumbnail_url:
                    public_id = blog.thumbnail_url.split('/')[-1].split('.')[0]
                    cloudinary.uploader.destroy(public_id)
                upload_result = cloudinary.uploader.upload(request.FILES['thumbnail'])
                blog.thumbnail_url = upload_result['secure_url']
            
            if 'title' in data:
                blog.title = data['title']
            if 'content' in data:
                blog.content = data['content']
            # Replace categories and tags with new lists if provided, otherwise keep existing
            if 'categories[]' in data:
                blog.categories = data.getlist('categories[]', [])
            if 'tags[]' in data:
                blog.tags = data.getlist('tags[]', [])
            blog.updated_at = datetime.utcnow()
            
            if 'is_published' in data:
                if data['is_published']:
                    blog.publish(username)
                else:
                    blog.unpublish(username)
            
            blog.save()
            
            return Response({
                "message": "Blog updated successfully",
                "version": blog.current_version,
                "thumbnail_url": blog.thumbnail_url,
                "status": "published" if blog.is_published else "draft",
                "categories": blog.categories,
                "tags": blog.tags
            })
            
        except DoesNotExist:
            return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PublishBlog(APIView):
    def post(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            username = request.data.get('username')
            
            if not username:
                return Response({"error": "username is required"}, status=400)
                
            user = User.objects(username=username).first()
            if not user:
                return Response({"error": "User not found"}, status=404)
                
            if user not in blog.authors:
                return Response({"error": "You are not authorized to publish this blog"}, 
                              status=403)
            
            blog.publish(username)
            
            for author in blog.authors:
                author.update(inc__total_publications=1)
            
            dhaka_tz = pytz.timezone('Asia/Dhaka')  # Define Asia/Dhaka timezone
            published_at_dhaka = blog.published_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)  # Convert to Asia/Dhaka
            
            return Response({
                "message": "Blog published successfully",
                "published_at": published_at_dhaka.isoformat(),
                "timezone": "Asia/Dhaka (UTC+6)"  # Indicate timezone
            })
            
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)

class UnpublishBlog(APIView):
    def post(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            username = request.data.get('username')
            
            if not username:
                return Response({"error": "username is required"}, status=400)
                
            user = User.objects(username=username).first()
            if not user:
                return Response({"error": "User not found"}, status=404)
                
            if user not in blog.authors:
                return Response({"error": "You are not authorized to unpublish this blog"}, 
                              status=403)
            
            if blog.is_published:
                for author in blog.authors:
                    author.update(dec__total_publications=1)
            
            blog.unpublish(username)
            return Response({"message": "Blog unpublished and moved to drafts"})
            
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)

class DeleteBlog(APIView):
    def delete(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            username = request.data.get('username')
            
            if not username:
                return Response({"error": "username required"}, status=status.HTTP_400_BAD_REQUEST)
                
            user = User.objects(username=username).first()
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            if user not in blog.authors:
                return Response({"error": "You can only delete your own blogs"}, 
                               status=status.HTTP_403_FORBIDDEN)
            
            # Use soft delete instead of hard delete
            blog.soft_delete(username)

            return Response({
                "message": "Blog moved to trash successfully"
            }, status=200)
            
        except DoesNotExist:
            return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)

class SaveAsDraft(APIView):
    def post(self, request, blog_id):
        try:
            # Fetch the blog
            blog = Blog.objects.get(id=blog_id, is_deleted=False)
            username = request.data.get('username')
            
            # Validate username
            if not username:
                return Response({"error": "username is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate user exists and is authorized
            user = User.objects(username=username).first()
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            if user not in blog.authors:
                return Response({"error": "You are not authorized to modify this blog"}, 
                               status=status.HTTP_403_FORBIDDEN)
            
            # Handle thumbnail upload if provided
            if 'thumbnail' in request.FILES:
                if blog.thumbnail_url:  # Delete old thumbnail if exists
                    public_id = blog.thumbnail_url.split('/')[-1].split('.')[0]
                    cloudinary.uploader.destroy(public_id)
                upload_result = cloudinary.uploader.upload(request.FILES['thumbnail'])
                blog.thumbnail_url = upload_result['secure_url']
            
            # Update blog fields if provided in request data
            data = request.data
            if 'title' in data:
                blog.title = data['title']
            if 'content' in data:
                blog.content = data['content']
            # Replace categories and tags with new lists if provided, otherwise keep existing
            if 'categories[]' in data:
                blog.categories = data.getlist('categories[]', [])
            if 'tags[]' in data:
                blog.tags = data.getlist('tags[]', [])
            
            # Ensure blog is marked as draft
            blog.is_draft = True
            blog.is_published = False
            blog.updated_at = datetime.utcnow()
            
            # Add to draft history
            if not blog.draft_history:
                blog.draft_history = []
            blog.draft_history.append(datetime.utcnow())
            
            # Save the current state as a new version
            blog.save_version(username)
            
            # Save the blog
            blog.save()
            
            # Prepare response
            dhaka_tz = pytz.timezone('Asia/Dhaka')
            updated_at_dhaka = blog.updated_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)
            
            return Response({
                "message": "Blog saved as draft",
                "id": str(blog.id),
                "title": blog.title,
                "content": blog.content,
                "thumbnail_url": blog.thumbnail_url,
                "categories": blog.categories,
                "tags": blog.tags,
                "status": "draft",
                "version": blog.current_version,
                "draft_saved_at": updated_at_dhaka.isoformat(),
                "timezone": "Asia/Dhaka (UTC+6)"
            }, status=status.HTTP_200_OK)
        
        except DoesNotExist:
            return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except cloudinary.exceptions.Error as e:
            return Response({"error": f"Image upload failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetBlogVersions(APIView):
    def get(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            dhaka_tz = pytz.timezone('Asia/Dhaka')  # Define Asia/Dhaka timezone
            versions = []
            for idx, version in enumerate(blog.versions, 1):
                updated_at_dhaka = version.updated_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)  # Convert to Asia/Dhaka
                versions.append({
                    "version": idx,
                    "title": version.title,
                    "content": version.content,
                    "updated_at": updated_at_dhaka.isoformat(),  # Use converted timestamp
                    "updated_by": version.updated_by,
                    "thumbnail_url": version.thumbnail_url,
                    "categories": version.categories,
                    "tags": version.tags
                })
            return Response({
                "blog_id": str(blog.id),
                "current_version": blog.current_version,
                "versions": versions,
                "timezone": "Asia/Dhaka (UTC+6)"  # Indicate timezone in response
            })
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)

class RevertBlogVersion(APIView):
    def post(self, request, blog_id, version_number):
        try:
            blog = Blog.objects.get(id=blog_id)
            username = request.data.get('username')
            
            if not username:
                return Response({"error": "username is required"}, status=status.HTTP_400_BAD_REQUEST)
                
            user = User.objects(username=username).first()
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
                
            if user not in blog.authors:
                return Response({"error": "You are not authorized to revert this blog"}, 
                               status=status.HTTP_403_FORBIDDEN)
            
            if blog.revert_to_version(version_number, username):
                return Response({
                    "message": f"Reverted to version {version_number}",
                    "new_version": blog.current_version
                })
            else:
                return Response({"error": "Invalid version number"}, status=status.HTTP_400_BAD_REQUEST)
                
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)

class RestoreBlog(APIView):
    def post(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            username = request.data.get('username')
            
            if not username:
                return Response({"error": "username required"}, status=status.HTTP_400_BAD_REQUEST)
                
            user = User.objects(username=username).first()
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            if user not in blog.authors:
                return Response({"error": "You can only restore your own blogs"}, 
                               status=status.HTTP_403_FORBIDDEN)
            
            blog.is_deleted = False
            blog.deleted_at = None
            blog.deleted_by = None
            blog.save()
            
            return Response({
                "message": "Blog restored from trash",
                "status": "published" if blog.is_published else "draft"
            })
            
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)

class ModeratorDeleteBlog(APIView):
    def delete(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            
            Comment.objects(blog=blog).delete()
            
            BlogReport.objects(blog=blog).delete()
            
            blog.delete()
            
            return Response({
                "message": "Blog and all associated comments and reports permanently deleted",
                "deleted_comments": Comment.objects(blog=blog).count(),
                "deleted_reports": BlogReport.objects(blog=blog).count()
            })
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)
        
class BlogSearch(APIView):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        status_filter = request.GET.get('status', None)
        
        if not query:
            return Response({"error": "Search query 'q' parameter required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from mongoengine.queryset.visitor import Q
            
            search_query = (
                Q(title__icontains=query) |
                Q(content__icontains=query) |
                Q(tags__icontains=query) |
                Q(categories__icontains=query)
            ) & Q(is_deleted=False)
            
            if status_filter == 'published':
                search_query &= Q(is_published=True, is_draft=False)
            elif status_filter == 'draft':
                search_query &= Q(is_draft=True, is_published=False)
            
            blogs = Blog.objects(search_query)
            
            dhaka_tz = pytz.timezone('Asia/Dhaka')  # Define Asia/Dhaka timezone
            results = []
            for blog in blogs:
                created_at_dhaka = blog.created_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)  # Convert to Asia/Dhaka
                results.append({
                    "id": str(blog.id),
                    "title": blog.title,
                    "authors": [author.username for author in blog.authors],
                    "excerpt": blog.content[:100] + "..." if len(blog.content) > 100 else blog.content,
                    "categories": blog.categories,
                    "tags": blog.tags,
                    "thumbnail_url": blog.thumbnail_url,
                    "status": "published" if blog.is_published else "draft",
                    "created_at": created_at_dhaka.isoformat(),
                    "timezone": "Asia/Dhaka (UTC+6)"  # Indicate timezone
                })
            
            return Response(results)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AddAuthorToBlog(APIView):
    def post(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            username = request.data.get('username')
            new_author_username = request.data.get('new_author')
            
            if not username or not new_author_username:
                return Response({"error": "Both username and new_author are required"}, 
                              status=status.HTTP_400_BAD_REQUEST)
                
            user = User.objects(username=username).first()
            new_author = User.objects(username=new_author_username).first()
            
            if not user or not new_author:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
                
            if user not in blog.authors:
                return Response({"error": "You are not authorized to add authors to this blog"}, 
                               status=status.HTTP_403_FORBIDDEN)
                               
            if new_author in blog.authors:
                return Response({"error": "User is already an author of this blog"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            blog.authors.append(new_author)
            blog.save()
            
            return Response({
                "message": f"Added {new_author_username} as an author",
                "authors": [author.username for author in blog.authors]
            })
            
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)
        
class PublishedBlogs(APIView):
    def get(self, request):
        """
        Get ALL published blogs with pagination
        Query Parameters:
        - page: Page number (default: 1)
        - per_page: Items per page (default: 10)
        - category: Filter by category
        - author: Filter by author username
        - reviewed: Filter by review status (true/false)
        """
        try:
            query = Blog.objects(
                is_published=True,
                is_draft=False,
                is_deleted=False
            ).order_by('-published_at')

            category = request.GET.get('category')
            if category:
                query = query.filter(categories__in=[category])

            author = request.GET.get('author')
            if author:
                query = query.filter(authors__username=author)

            reviewed = request.GET.get('reviewed')
            if reviewed is not None:
                query = query.filter(is_reviewed=(reviewed.lower() == 'true'))

            page_number = int(request.GET.get('page', 1))
            per_page = int(request.GET.get('per_page', 10))
            paginator = Paginator(query, per_page)

            try:
                current_page = paginator.page(page_number)
            except EmptyPage:
                return Response({
                    "success": False,
                    "error": "Page not found"
                }, status=status.HTTP_404_NOT_FOUND)

            dhaka_tz = pytz.timezone('Asia/Dhaka')
            blogs_list = []
            for blog in current_page:
                published_at_dhaka = blog.published_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)
                updated_at_dhaka = blog.updated_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)
                
                blog_data = {
                    "id": str(blog.id),
                    "title": blog.title,
                    "excerpt": blog.content,
                    "content": blog.content,
                    "authors": [{
                        "username": author.username,
                        "avatar": getattr(author, 'avatar_url', None)
                    } for author in blog.authors],
                    "thumbnail_url": blog.thumbnail_url,
                    "categories": blog.categories,
                    "tags": blog.tags,
                    "published_at": published_at_dhaka.isoformat(),
                    "updated_at": updated_at_dhaka.isoformat(),
                    "is_reviewed": blog.is_reviewed,
                    "reviewed_by": blog.reviewed_by.username if blog.reviewed_by else None,
                    "upvote_count": blog.upvote_count,
                    "downvote_count": blog.downvote_count,
                    "stats": {
                        "upvotes": len(blog.upvotes),
                        "downvotes": len(blog.downvotes)
                    }
                }
                blogs_list.append(blog_data)

            return Response({
                "success": True,
                "blogs": blogs_list,
                "pagination": {
                    "current_page": page_number,
                    "per_page": per_page,
                    "total_pages": paginator.num_pages,
                    "total_blogs": paginator.count,
                    "has_next": current_page.has_next(),
                    "has_previous": current_page.has_previous(),
                    "next_page": current_page.next_page_number() if current_page.has_next() else None,
                    "previous_page": current_page.previous_page_number() if current_page.has_previous() else None
                },
                "filters": {
                    "applied_category": category,
                    "applied_author": author,
                    "applied_reviewed": reviewed
                }
            })

        except Exception as e:
            return Response({
                "success": False,
                "error": "Failed to fetch published blogs",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ReviewBlog(APIView):
    def post(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id)
            reviewer = User.objects.get(username=request.data.get('reviewer'))
            
            blog.is_reviewed = True
            blog.reviewed_by = reviewer
            blog.save()
            
            dhaka_tz = pytz.timezone('Asia/Dhaka')  # Define Asia/Dhaka timezone
            reviewed_at_dhaka = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(dhaka_tz)  # Convert to Asia/Dhaka
            
            return Response({
                "success": True,
                "message": "Blog reviewed and approved",
                "reviewed_by": reviewer.username,
                "reviewed_at": reviewed_at_dhaka.isoformat(),
                "timezone": "Asia/Dhaka (UTC+6)"  # Indicate timezone
            })
            
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=404)
        except User.DoesNotExist:
            return Response({"error": "Reviewer not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        
class CreateDraft(APIView):
    def post(self, request):
        try:
            username = request.data.get('username')
            if not username:
                return Response({"error": "username is required"}, status=400)
            
            user = User.objects.get(username=username)
            blog = Blog().create_draft(user)
            
            dhaka_tz = pytz.timezone('Asia/Dhaka')  # Define Asia/Dhaka timezone
            created_at_dhaka = blog.created_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)  # Convert to Asia/Dhaka
            
            return Response({
                "id": str(blog.id),
                "title": blog.title,
                "status": "draft",
                "is_draft": True,
                "is_published": False,
                "created_at": created_at_dhaka.isoformat(),
                "version": blog.current_version,
                "timezone": "Asia/Dhaka (UTC+6)"  # Indicate timezone
            }, status=201)
            
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class UpdateDraft(APIView):
    def put(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id, is_draft=True)
            username = request.data.get('username')
            
            if not username:
                return Response({"error": "username is required"}, status=400)
                
            user = User.objects.get(username=username)
            if user not in blog.authors:
                return Response({"error": "Not authorized"}, status=403)
            
            data = request.data
            if 'title' in data:
                blog.title = data['title']
            if 'content' in data:
                blog.content = data['content']
            # Replace categories and tags with new lists if provided, otherwise keep existing
            if 'categories[]' in data:
                blog.categories = data.getlist('categories[]', [])
            if 'tags[]' in data:
                blog.tags = data.getlist('tags[]', [])
            
            blog.save()
            blog.save_version(username)
            
            if 'thumbnail' in request.FILES:
                upload_result = cloudinary.uploader.upload(request.FILES['thumbnail'])
                blog.thumbnail_url = upload_result['secure_url']
                blog.save()
            
            return Response({
                "id": str(blog.id),
                "title": blog.title,
                "content": blog.content,
                "thumbnail_url": blog.thumbnail_url,
                "categories": blog.categories,
                "tags": blog.tags,
                "version": blog.current_version
            })
            
        except Blog.DoesNotExist:
            return Response({"error": "Draft not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
class GetBlog(APIView):
    def get(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id, is_deleted=False)
            
            username = request.GET.get('username')
            has_upvoted = False
            has_downvoted = False
            is_saved = False
            
            if username:
                user = User.objects(username=username).first()
                if user:
                    # Check if user has voted on this blog
                    has_upvoted = str(blog.id) in user.upvoted_blogs
                    has_downvoted = str(blog.id) in user.downvoted_blogs
                    # Check if blog is saved
                    is_saved = str(blog.id) in user.saved_blogs
            
            dhaka_tz = pytz.timezone('Asia/Dhaka')  # Define Asia/Dhaka timezone
            created_at_dhaka = blog.created_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)  # Convert to Asia/Dhaka
            updated_at_dhaka = blog.updated_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)  # Convert to Asia/Dhaka
            published_at_dhaka = blog.published_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz) if blog.published_at else None  # Convert to Asia/Dhaka
            
            return Response({
                "id": str(blog.id),
                "title": blog.title,
                "content": blog.content,
                "thumbnail_url": blog.thumbnail_url,
                "authors": [{"username": author.username, "avatar": getattr(author, 'avatar_url', None)} 
                           for author in blog.authors],
                "categories": blog.categories,
                "tags": blog.tags,
                "created_at": created_at_dhaka.isoformat(),
                "updated_at": updated_at_dhaka.isoformat(),
                "status": "published" if blog.is_published else "draft",
                "published_at": published_at_dhaka.isoformat() if published_at_dhaka else None,
                "upvotes": blog.upvote_count,
                "downvotes": blog.downvote_count,
                "has_upvoted": has_upvoted,
                "has_downvoted": has_downvoted,
                "is_saved": is_saved,
                "versions": blog.current_version,
                "is_draft": blog.is_draft,
                "is_published": blog.is_published,
                "timezone": "Asia/Dhaka (UTC+6)"  # Indicate timezone
            })
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)

class VoteBlog(APIView):
    def post(self, request, blog_id):
        data = request.data
        try:
            blog = Blog.objects.get(id=blog_id)
            user = User.objects(username=data.get('username')).first()
            
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
                
            vote_type = data.get('type')
            if vote_type not in ['upvote', 'downvote']:
                return Response({"error": "Invalid vote type"}, status=status.HTTP_400_BAD_REQUEST)

            with mongoengine.get_connection().start_session() as session:
                with session.start_transaction():
                    existing_vote = Vote.objects(blog=blog, user=user).first()
                    has_upvoted = False
                    has_downvoted = False
                    
                    if existing_vote:
                        if existing_vote.vote_type == vote_type:
                            # User is removing their existing vote
                            existing_vote.delete()
                            if vote_type == 'upvote':
                                blog.upvote_count -= 1
                                # Remove from user's upvoted blogs
                                if str(blog.id) in user.upvoted_blogs:
                                    user.upvoted_blogs.remove(str(blog.id))
                            else:
                                blog.downvote_count -= 1
                                # Remove from user's downvoted blogs
                                if str(blog.id) in user.downvoted_blogs:
                                    user.downvoted_blogs.remove(str(blog.id))
                        else:
                            # User is changing their vote
                            old_vote_type = existing_vote.vote_type
                            existing_vote.vote_type = vote_type
                            existing_vote.created_at = timezone.now()
                            existing_vote.save()
                            if vote_type == 'upvote':
                                blog.upvote_count += 1
                                blog.downvote_count -= 1
                                # Move from downvoted to upvoted
                                if str(blog.id) in user.downvoted_blogs:
                                    user.downvoted_blogs.remove(str(blog.id))
                                if str(blog.id) not in user.upvoted_blogs:
                                    user.upvoted_blogs.append(str(blog.id))
                            else:
                                blog.downvote_count += 1
                                blog.upvote_count -= 1
                                # Move from upvoted to downvoted
                                if str(blog.id) in user.upvoted_blogs:
                                    user.upvoted_blogs.remove(str(blog.id))
                                if str(blog.id) not in user.downvoted_blogs:
                                    user.downvoted_blogs.append(str(blog.id))
                    else:
                        # User is adding a new vote
                        Vote(blog=blog, user=user, vote_type=vote_type).save()
                        if vote_type == 'upvote':
                            blog.upvote_count += 1
                            # Add to user's upvoted blogs
                            if str(blog.id) not in user.upvoted_blogs:
                                user.upvoted_blogs.append(str(blog.id))
                        else:
                            blog.downvote_count += 1
                            # Add to user's downvoted blogs
                            if str(blog.id) not in user.downvoted_blogs:
                                user.downvoted_blogs.append(str(blog.id))

                    blog.save()
                    user.save()

            # After all operations, check what the user's current vote status is
            current_vote = Vote.objects(blog=blog, user=user).first()
            if current_vote:
                has_upvoted = current_vote.vote_type == 'upvote'
                has_downvoted = current_vote.vote_type == 'downvote'

            return Response({
                "upvotes": blog.upvote_count,
                "downvotes": blog.downvote_count,
                "has_upvoted": has_upvoted,
                "has_downvoted": has_downvoted
            })
            
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)
        except NotUniqueError:
            return Response({"error": "User has already voted"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)