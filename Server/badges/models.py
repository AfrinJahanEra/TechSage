import mongoengine as me
from users.models import User 
import cloudinary
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

class Badge(me.Document):
    name = me.StringField(required=True, unique=True)
    description = me.StringField()
    image_public_id = me.StringField()
    image_url = me.StringField(required=True)
    points_required = me.IntField(required=True)
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'badges',
        'ordering': ['-points_required']
    }

    def upload_image(self, file):
        """Handle badge image upload to Cloudinary"""
        try:
            if self.image_public_id:
                cloudinary.uploader.destroy(self.image_public_id)
            
            upload_result = cloudinary.uploader.upload(
                file,
                folder="techsage/badges",
                allowed_formats=['png', 'svg', 'jpg', 'jpeg']
            )
            self.image_public_id = upload_result['public_id']
            self.image_url = upload_result['secure_url']
            return True
        except Exception as e:
            print(f"Badge image upload error: {e}")
            return False

    def clean(self):
        self.updated_at = datetime.datetime.utcnow()

class UserBadge(me.Document):
    user = me.ReferenceField(User, required=True)
    badge = me.ReferenceField(Badge, required=True)
    awarded_at = me.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'user_badges',
        'indexes': [
            ('user', 'badge'),
            'user',
            'badge'
        ]
    }

    def clean(self):
        if UserBadge.objects(user=self.user, badge=self.badge).count() > 0:
            raise me.ValidationError("User already has this badge")
        
        if self.user.points < self.badge.points_required:
            raise me.ValidationError(
                f"User needs {self.badge.points_required} points for this badge (has {self.user.points})"
            )