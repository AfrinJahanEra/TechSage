from datetime import datetime
from mongoengine import Document, fields
from users.models import User

class Blog(Document):
    title = fields.StringField(required=True)
    content = fields.StringField(required=True)
    author = fields.ReferenceField(User)
    created_at = fields.DateTimeField(default=datetime.utcnow)  # Changed here
    
    meta = {
        'collection': 'blogs',
        'ordering': ['-created_at']
    }