# users/models.py
import mongoengine as me
import datetime


class User(me.Document):
    username = me.StringField(required=True, unique=True)
    email = me.EmailField(required=True, unique=True)
    password = me.StringField(required=True)
    is_reviewer = me.BooleanField(default=False)
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_json(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "is_reviewer": self.is_reviewer,
        }
