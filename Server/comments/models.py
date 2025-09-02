import mongoengine as me
import datetime
import pytz
from users.models import User
from blogs.models import Blog

class Comment(me.Document):
    blog = me.ReferenceField(Blog, required=True)
    author = me.ReferenceField(User, required=True)
    content = me.StringField(required=True)
    parent = me.ReferenceField('self', null=True, default=None)
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.datetime.utcnow)
    likes = me.ListField(me.ReferenceField(User))
    dislikes = me.ListField(me.ReferenceField(User))
    is_deleted = me.BooleanField(default=False)
    is_reviewed = me.BooleanField(default=False)  
    reviewed_by = me.ReferenceField(User, null=True) 

    meta = {
        'ordering': ['-created_at'],
        'indexes': [
            'is_reviewed',
            'blog',
            'author'
        ]
    }

    def to_json(self):
        dhaka_tz = pytz.timezone('Asia/Dhaka')  # Define Asia/Dhaka timezone
        created_at_dhaka = self.created_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)  # Convert to Asia/Dhaka
        updated_at_dhaka = self.updated_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)  # Convert to Asia/Dhaka
        return {
            "id": str(self.id),
            "blog": str(self.blog.id),
            "author": {
                "username": self.author.username,
                "avatar_url": self.author.avatar_url if hasattr(self.author, 'avatar_url') else None
            },
            "content": self.content,
            "parent": str(self.parent.id) if self.parent else None,
            "created_at": created_at_dhaka.isoformat(),
            "updated_at": updated_at_dhaka.isoformat(),
            "likes": len(self.likes),
            "dislikes": len(self.dislikes),
            "is_deleted": self.is_deleted,
            "is_reviewed": self.is_reviewed, 
            "reviewed_by": self.reviewed_by.username if self.reviewed_by else None,
            "timezone": "Asia/Dhaka (UTC+6)"  # Indicate timezone in response
        }