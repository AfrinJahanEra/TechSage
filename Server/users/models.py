import mongoengine as me
import datetime
import cloudinary
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

class User(me.Document):
    username = me.StringField(required=True, unique=True)
    email = me.EmailField(required=True, unique=True)
    password = me.StringField(required=True)
    is_user = me.BooleanField(default=True)
    is_admin = me.BooleanField(default=False)
    is_reviewer = me.BooleanField(default=False)
    role = me.StringField(default='user', choices=['user', 'moderator', 'admin'])
    avatar_public_id = me.StringField()
    avatar_url = me.StringField()
    job_title = me.StringField(default='User')
    university = me.StringField()
    bio = me.StringField(max_length=500, default='')
    is_verified = me.BooleanField(default=False)
    points = me.IntField(default=0)
    total_publications = me.IntField(default=0)
    followers = me.IntField(default=0)
    source = me.StringField()
    saved_blogs = me.ListField(me.StringField())
    created_at = me.DateTimeField(default=datetime.datetime.now)
    updated_at = me.DateTimeField(default=datetime.datetime.now)
    badge = me.StringField(choices=['ruby', 'bronze', 'sapphire', 'silver', 'gold', 'diamond'], default=None)

    meta = {
        'strict': False,
        'indexes': ['username', 'email', 'role']
    }

    def clean(self):
        if self.role == 'admin':
            self.is_admin = True
            self.is_user = False
            self.is_reviewer = False
        elif self.role == 'moderator':
            self.is_reviewer = True
            self.is_user = False
            self.is_admin = False
        else:
            self.is_user = True
            self.is_admin = False
            self.is_reviewer = False

    def upload_avatar(self, file):
        """Handle avatar upload to Cloudinary"""
        try:
            if self.avatar_public_id:
                cloudinary.uploader.destroy(self.avatar_public_id)
            
            upload_result = cloudinary.uploader.upload(
                file,
                folder="techsage/avatars",
                allowed_formats=['jpg', 'png', 'jpeg']
            )
            self.avatar_public_id = upload_result['public_id']
            self.avatar_url = upload_result['secure_url']
            return True
        except Exception as e:
            print(f"Avatar upload error: {e}")
            return False

    def to_json(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "avatar_url": self.avatar_url,
            "job_title": self.job_title,
            "university": self.university,
            "bio": self.bio,
            "role": self.role,
            "is_verified": self.is_verified,
            "points": self.points,
            "total_publications": self.total_publications,
            "followers": self.followers,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
