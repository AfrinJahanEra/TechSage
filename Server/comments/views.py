from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from .models import Comment
from blogs.models import Blog
from users.models import User
from django.http import JsonResponse
from django.views import View
from .models import Comment
from django.core.paginator import Paginator



@method_decorator(csrf_exempt, name='dispatch')
class PostComment(View):
    def post(self, request):
        data = json.loads(request.body)
        blog = Blog.objects(id=data['blog_id']).first()
        author = User.objects(username=data['author']).first()
        content = data['content']
        parent = Comment.objects(id=data['parent_id']).first() if 'parent_id' in data else None

        if not blog or not author:
            return JsonResponse({'error': 'Invalid blog or author'}, status=400)

        comment = Comment(
            blog=blog,
            author=author,
            content=content,
            parent=parent
        )
        comment.save()
        return JsonResponse(comment.to_json(), status=201)

class GetComments(View):
    def get(self, request, blog_id):
        comments = Comment.objects(blog=blog_id, is_deleted=False).order_by('-created_at')
        return JsonResponse([c.to_json() for c in comments], safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class LikeComment(View):
    def post(self, request, comment_id):
        data = json.loads(request.body)
        user = User.objects(username=data['username']).first()
        comment = Comment.objects(id=comment_id).first()

        if not comment or not user:
            return JsonResponse({'error': 'Invalid comment or user'}, status=400)

        if user not in comment.likes:
            comment.likes.append(user)
            if user in comment.dislikes:
                comment.dislikes.remove(user)
        else:
            comment.likes.remove(user)

        comment.save()
        return JsonResponse(comment.to_json())

@method_decorator(csrf_exempt, name='dispatch')
class DeleteComment(View):
    def post(self, request, comment_id):
        data = json.loads(request.body)
        user = User.objects(username=data['username']).first()
        comment = Comment.objects(id=comment_id).first()

        if not comment or not user:
            return JsonResponse({'error': 'Invalid comment or user'}, status=400)

        # Only allow author or admin to delete
        if comment.author.username != user.username and user.role != 'moderator':
            return JsonResponse({'error': 'Unauthorized'}, status=403)

        comment.is_deleted = True
        comment.save()
        return JsonResponse({'message': 'Comment marked as deleted'})
    

class GetAllComments(View):
    def get(self, request):
        try:
            # Get query parameters
            page = request.GET.get('page', 1)
            per_page = request.GET.get('per_page', 20)
            reviewed = request.GET.get('reviewed')
            
            # Base query
            query = Comment.objects(is_deleted=False)
            
            # Filter by review status if provided
            if reviewed is not None:
                query = query.filter(is_reviewed=(reviewed.lower() == 'true'))
            
            # Pagination
            paginator = Paginator(query, per_page)
            comments_page = paginator.page(page)
            
            # Prepare response
            comments_data = [c.to_json() for c in comments_page]
            
            return JsonResponse({
                'success': True,
                'comments': comments_data,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total_pages': paginator.num_pages,
                    'total_comments': paginator.count
                }
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
        

@method_decorator(csrf_exempt, name='dispatch')
class ReviewComment(View):
    def post(self, request, comment_id):
        try:
            data = json.loads(request.body)
            reviewer = User.objects(username=data['reviewer']).first()
            comment = Comment.objects(id=comment_id).first()
            
            if not comment or not reviewer:
                return JsonResponse({'error': 'Invalid comment or reviewer'}, status=400)
                
            comment.is_reviewed = True
            comment.reviewed_by = reviewer
            comment.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Comment reviewed successfully',
                'comment': comment.to_json()
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)


class GetCommentsByBlog(View):
    def get(self, request, blog_id):
        try:
            page = int(request.GET.get('page', 1))
            per_page = int(request.GET.get('per_page', 10))

            query = Comment.objects(blog=blog_id, is_deleted=False).order_by('-created_at')
            paginator = Paginator(query, per_page)
            page_obj = paginator.page(page)

            return JsonResponse({
                'success': True,
                'comments': [c.to_json() for c in page_obj],
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total_pages': paginator.num_pages,
                    'total_comments': paginator.count
                }
            })
