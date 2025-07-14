import mongoengine as me
import datetime
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
    is_reviewed = me.BooleanField(default=False)  # New field
    reviewed_by = me.ReferenceField(User, null=True)  # New field

    meta = {
        'ordering': ['-created_at'],
        'indexes': [
            'is_reviewed',
            'blog',
            'author'
        ]
    }

    def to_json(self):
        return {
            "id": str(self.id),
            "blog": str(self.blog.id),
            "author": {
                "username": self.author.username,
                "avatar_url": self.author.avatar_url if hasattr(self.author, 'avatar_url') else None
            },
            "content": self.content,
            "parent": str(self.parent.id) if self.parent else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "likes": len(self.likes),
            "dislikes": len(self.dislikes),
            "is_deleted": self.is_deleted,
            "is_reviewed": self.is_reviewed,  # New field in response
            "reviewed_by": self.reviewed_by.username if self.reviewed_by else None  # New field in response
        }