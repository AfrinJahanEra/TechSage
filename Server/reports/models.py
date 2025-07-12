import mongoengine as me
from users.models import User
from blogs.models import Blog
import datetime

class BlogReport(me.Document):
    blog = me.ReferenceField(Blog, required=True)
    reported_by = me.ReferenceField(User, required=True)
    reason = me.StringField(required=True, choices=(
        'inaccurate', 
        'plagiarism', 
        'methodological', 
        'other'
    ))
    details = me.StringField(required=True)
    is_approved = me.BooleanField(default=False)
    reviewed_by = me.ReferenceField(User)
    action_taken = me.StringField(choices=('approved', 'rejected'))
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    reviewed_at = me.DateTimeField()

    meta = {
        'ordering': ['-created_at'],
        'indexes': [
            'is_approved',
            'action_taken',
            'blog',
            'reported_by',
            'reviewed_by'
        ]
    }

    def to_json(self):
        return {
            "id": str(self.id),
            "blog": {
                "id": str(self.blog.id),
                "title": self.blog.title,
                "thumbnail_url": self.blog.thumbnail_url
            },
            "reported_by": {
                "id": str(self.reported_by.id),
                "username": self.reported_by.username,
                "avatar": self.reported_by.avatar_url
            },
            "reason": self.reason,
            "details": self.details,
            "is_approved": self.is_approved,
            "reviewed_by": {
                "id": str(self.reviewed_by.id),
                "username": self.reviewed_by.username
            } if self.reviewed_by else None,
            "action_taken": self.action_taken,
            "created_at": self.created_at.isoformat(),
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None
        }