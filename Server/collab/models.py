import mongoengine as me
import datetime
from users.models import User
from blogs.models import Blog

class CollaborationRequest(me.Document):
    sender = me.ReferenceField(User, required=True)
    receiver = me.ReferenceField(User, required=True)
    blog = me.ReferenceField(Blog, required=True)
    message = me.StringField()
    status = me.StringField(choices=["pending", "accepted", "rejected"], default="pending")
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_json(self):
        return {
            "id": str(self.id),
            "sender": self.sender.username,
            "receiver": self.receiver.username,
            "blog_id": str(self.blog.id),
            "blog_title": self.blog.title,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat()
        }