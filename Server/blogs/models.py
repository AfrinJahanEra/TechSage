from mongoengine import Document, fields
from users.models import User

class Blog(Document):
    title = fields.StringField(required=True)
    content = fields.StringField(required=True)
    author = fields.ReferenceField(User)
    created_at = fields.DateTimeField(auto_now_add=True)
    
    meta = {
        'collection': 'blogs',
        'ordering': ['-created_at']
    }