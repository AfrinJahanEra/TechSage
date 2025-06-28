from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from .models import Comment
from blogs.models import Blog
from users.models import User

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
        if comment.author.username != user.username and user.role != 'admin':
            return JsonResponse({'error': 'Unauthorized'}, status=403)

        comment.is_deleted = True
        comment.save()
        return JsonResponse({'message': 'Comment marked as deleted'})