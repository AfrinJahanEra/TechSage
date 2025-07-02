import mongoengine as me
from users.models import User
from blogs.models import Blog
import datetime

class BlogReport(me.Document):
    blog = me.ReferenceField(Blog, required=True)
    reported_by = me.ReferenceField(User, required=True)
    reason = me.StringField(required=True)
    is_approved = me.BooleanField(default=False)
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_json(self):
        return {
            "id": str(self.id),
            "blog": str(self.blog.id),
            "reported_by": self.reported_by.username,
            "reason": self.reason,
            "is_approved": self.is_approved,
            "created_at": self.created_at.isoformat()
        }
