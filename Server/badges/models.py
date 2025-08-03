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
        """Assign all badges user qualifies for based on points"""
        # Get all badges ordered by points_required
        all_badges = cls.objects.order_by('points_required')
        
        # Clear existing badges
        user.badges = []
        
        # Assign all badges user qualifies for
        for badge in all_badges:
            if user.points >= badge.points_required:
                user.badges.append({
                    'name': badge.name,
                    'title': badge.title,
                    'image_url': badge.image_url
                })
        
        user.save()
        return user