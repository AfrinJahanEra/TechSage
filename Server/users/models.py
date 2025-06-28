import mongoengine as me
import datetime
import cloudinary.uploader

class User(me.Document):
    username = me.StringField(required=True, unique=True)
    email = me.EmailField(required=True, unique=True)
    password = me.StringField(required=True)
    avatar_url = me.StringField()
    university = me.StringField()
    role = me.StringField(default='user', choices=['user', 'moderator', 'admin'])
    is_reviewer = me.BooleanField(default=False)
    created_at = me.DateTimeField(default=datetime.datetime.now)
    updated_at = me.DateTimeField(default=datetime.datetime.now)

    def to_json(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "avatar_url": self.avatar_url,
            "university": self.university,
            "role": self.role,
            "is_reviewer": self.is_reviewer,
            "created_at": self.created_at.isoformat()
        }