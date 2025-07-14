from django.db import models
from datetime import datetime
from mongoengine import Document, fields
from users.models import User
from blogs.models import Blog

class AuthorRequest(Document):
    blog = fields.ReferenceField(Blog, required=True)
    requested_author = fields.ReferenceField(User, required=True)  # The user being requested to become an author
    requesting_author = fields.ReferenceField(User, required=True)  # The user who made the request
    status = fields.StringField(default='pending', choices=['pending', 'accepted', 'rejected'])
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'author_requests',
        'indexes': [
            'blog',
            'requested_author',
            'requesting_author',
            'status'
        ]
    }
