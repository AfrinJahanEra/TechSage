import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from blogs.models import Blog

class BlogCreateConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'blog_create'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            title = data.get('title')
            content = data.get('content')
            categories = data.get('categories', [])
            tags = data.get('tags', [])
            thumbnail_url = data.get('thumbnail_url')

            # Validate data
            if not any([title, content, categories, tags, thumbnail_url]):
                return

            # Broadcast to group
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'blog_update',
                    'title': title,
                    'content': content,
                    'categories': categories,
                    'tags': tags,
                    'thumbnail_url': thumbnail_url,
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON'}))
        except Exception as e:
            await self.send(text_data=json.dumps({'error': str(e)}))

    async def blog_update(self, event):
        # Send update to all clients
        await self.send(text_data=json.dumps({
            'title': event.get('title'),
            'content': event.get('content'),
            'categories': event.get('categories'),
            'tags': event.get('tags'),
            'thumbnail_url': event.get('thumbnail_url'),
        }))

class BlogUpdateConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.blog_id = self.scope['url_route']['kwargs']['blog_id']
        self.group_name = f'blog_update_{self.blog_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            title = data.get('title')
            content = data.get('content')
            categories = data.get('categories', [])
            tags = data.get('tags', [])
            thumbnail_url = data.get('thumbnail_url')

            # Validate data
            if not any([title, content, categories, tags, thumbnail_url]):
                return

            # Broadcast to group
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'blog_update',
                    'title': title,
                    'content': content,
                    'categories': categories,
                    'tags': tags,
                    'thumbnail_url': thumbnail_url,
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON'}))
        except Exception as e:
            await self.send(text_data=json.dumps({'error': str(e)}))

    async def blog_update(self, event):
        # Send update to all clients
        await self.send(text_data=json.dumps({
            'title': event.get('title'),
            'content': event.get('content'),
            'categories': event.get('categories'),
            'tags': event.get('tags'),
            'thumbnail_url': event.get('thumbnail_url'),
        }))