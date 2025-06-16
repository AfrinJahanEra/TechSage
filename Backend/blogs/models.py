# blogs/models.py
import mongoengine as me
from users.models import User
import datetime

class Blog(me.Document):
    title = me.StringField(required=True)
    content = me.StringField(required=True)
    author = me.ReferenceField(User, required=True)
    category = me.StringField(default="General")
    status = me.StringField(choices=["Draft", "Published", "Rejected"], default="Draft")
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_json(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "content": self.content,
            "author": self.author.to_json(),
            "category": self.category,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }
