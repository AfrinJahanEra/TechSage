from mongoengine import Document, StringField, IntField, ReferenceField, ListField
from users.models import User
import cloudinary.uploader

class Badge(Document):
    name = StringField(required=True, choices=[
        'ruby', 'bronze', 'silver', 'gold', 'diamond'
    ])
    image_url = StringField(required=True)
    points_required = IntField(required=True)
    title = StringField(required=True)  # e.g., "Specialist"
    
    meta = {
        'collection': 'badges',
        'ordering': ['points_required']
    }

    @classmethod
    def assign_badges(cls, user):
        """Assign all badges user qualifies for"""
        qualified_badges = cls.objects(points_required__lte=user.points)
        for badge in qualified_badges:
            if badge.name not in user.badges:
                user.badges.append(badge.name)
        return user.save()
