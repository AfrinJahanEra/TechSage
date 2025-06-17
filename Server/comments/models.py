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

    likes = me.ListField(me.ReferenceField(User))
    dislikes = me.ListField(me.ReferenceField(User))

    def to_json(self):
        return {
            "id": str(self.id),
            "blog": str(self.blog.id),
            "author": self.author.username,
            "content": self.content,
            "parent": str(self.parent.id) if self.parent else None,
            "created_at": self.created_at.isoformat(),
            "likes": len(self.likes),
            "dislikes": len(self.dislikes)
        }
