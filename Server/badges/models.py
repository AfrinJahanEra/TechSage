import mongoengine as me
from users.models import User
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import current_app
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

class Badge(me.Document):
    name = me.StringField(required=True, unique=True)
    image_url = me.StringField(required=True)
    points_required = me.IntField(required=True)
    description = me.StringField()
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'badges',
        'ordering': ['-points_required']
    }

    def __str__(self):
        return self.name

    @classmethod
    def get_badge_for_points(cls, points):
        """Get the appropriate badge for a given point value"""
        return cls.objects(points_required__lte=points).order_by('-points_required').first()

class UserBadge(me.Document):
    user = me.ReferenceField(User, required=True)
    badge = me.ReferenceField(Badge, required=True)
    awarded_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'user_badges',
        'indexes': [
            ('user', 'badge'),
            {'fields': ['user'], 'unique': False}
        ]
    }

    @classmethod
    def assign_appropriate_badge(cls, user):
        """Automatically assign the highest badge the user qualifies for"""
        if not user.points:
            return None

        appropriate_badge = Badge.get_badge_for_points(user.points)
        if not appropriate_badge:
            return None

        # Check if user already has this badge
        existing = cls.objects(user=user, badge=appropriate_badge).first()
        if existing:
            return existing

        # Assign new badge
        user_badge = cls(user=user, badge=appropriate_badge)
        user_badge.save()
        return user_badge

    def __str__(self):
        return f"{self.user.username} → {self.badge.name}"