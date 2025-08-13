import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Comment
from users.models import User
from blogs.models import Blog

class CommentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.blog_id = self.scope['url_route']['kwargs']['blog_id']
        self.room_group_name = f"comments_{self.blog_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        
        if action == 'new_comment':
            await self.handle_new_comment(data)
        elif action == 'like_comment':
            await self.handle_like_comment(data)
        elif action == 'delete_comment':
            await self.handle_delete_comment(data)

    async def handle_new_comment(self, data):
        author = User.objects(username=data['author']).first()
        blog = Blog.objects(id=self.blog_id).first()
        parent = Comment.objects(id=data.get('parent_id')).first() if data.get('parent_id') else None

        if not author or not blog:
            return

        comment = Comment(
            blog=blog,
            author=author,
            content=data['content'],
            parent=parent,
            is_reviewed=False,
            reviewed_by=None  
        )
        comment.save()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_comment',
                'action': 'new_comment',
                'comment': comment.to_json()
            }
        )

    async def handle_like_comment(self, data):
        comment = Comment.objects(id=data['comment_id']).first()
        user = User.objects(username=data['username']).first()

        if not comment or not user:
            return

        if user not in comment.likes:
            comment.likes.append(user)
            if user in comment.dislikes:
                comment.dislikes.remove(user)
        else:
            comment.likes.remove(user)

        comment.save()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_comment',
                'action': 'update_comment',
                'comment': comment.to_json()
            }
        )

    async def handle_delete_comment(self, data):
        comment = Comment.objects(id=data['comment_id']).first()
        user = User.objects(username=data['username']).first()

        if not comment or not user:
            return

        if comment.author.username != user.username and user.role not in ['admin', 'moderator']:
            return

        comment.is_deleted = True
        comment.save()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_comment',
                'action': 'delete_comment',
                'comment_id': str(comment.id),
                'parent_id': str(comment.parent.id) if comment.parent else None
            }
        )

    async def send_comment(self, event):
        await self.send(text_data=json.dumps(event))