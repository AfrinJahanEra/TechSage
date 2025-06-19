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
        author_id = data['author_id']
        content = data['content']
        parent_id = data.get('parent_id')

        author = User.objects(id=author_id).first()
        blog = Blog.objects(id=self.blog_id).first()
        parent = Comment.objects(id=parent_id).first() if parent_id else None

        comment = Comment(blog=blog, author=author, content=content, parent=parent)
        comment.save()

        response = comment.to_json()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_comment',
                'message': json.dumps(response)
            }
        )

    async def send_comment(self, event):
        await self.send(text_data=event['message'])
