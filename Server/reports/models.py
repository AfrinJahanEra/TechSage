import mongoengine as me
from users.models import User
from blogs.models import Blog
import datetime

class BlogReport(me.Document):
    blog = me.ReferenceField(Blog, required=True, reverse_delete_rule=me.CASCADE)
    reported_by = me.ReferenceField(User, required=True)
    reason = me.StringField(required=True, choices=(
        'inaccurate', 
        'plagiarism', 
        'methodological', 
        'other'
    ))
    details = me.StringField(required=True)
    status = me.StringField(default='pending', choices=('pending', 'accepted', 'rejected'))
    is_reviewed = me.BooleanField(default=False)
    reviewed_by = me.ReferenceField(User)
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    reviewed_at = me.DateTimeField()

    meta = {
        'ordering': ['-created_at'],
        'indexes': [
            'status',
            'is_reviewed',
            'blog',
            'reported_by',
            'reviewed_by'
        ]
    }

    def to_json(self):
        try:
            blog_data = {
                "id": str(self.blog.id),
                "title": self.blog.title,
                "thumbnail_url": self.blog.thumbnail_url
            } if self.blog else None
        except:
            blog_data = None

        try:
            reported_by_data = {
                "id": str(self.reported_by.id),
                "username": self.reported_by.username,
                "avatar": self.reported_by.avatar_url
            } if self.reported_by else None
        except:
            reported_by_data = None

        try:
            reviewed_by_data = {
                "id": str(self.reviewed_by.id),
                "username": self.reviewed_by.username
            } if self.reviewed_by else None
        except:
            reviewed_by_data = None

        return {
            "id": str(self.id),
            "blog": blog_data,
            "reported_by": reported_by_data,
            "reason": self.reason,
            "details": self.details,
            "status": self.status,
            "is_reviewed": self.is_reviewed,
            "reviewed_by": reviewed_by_data,
            "created_at": self.created_at.isoformat(),
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None
        }