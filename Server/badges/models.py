from mongoengine import Document, StringField, IntField, ReferenceField, ListField
from users.models import User
import cloudinary.uploader



class Badge(Document):
    name = StringField(required=True, choices=[
        'ruby', 'bronze', 'silver', 'gold', 'diamond'
    ])
    image_url = StringField(required=True)
    points_required = IntField(required=True, min_value=0)
    title = StringField(required=True)
    public_id = StringField()  # Store Cloudinary public_id for easier deletion
    
    meta = {
        'collection': 'badges',
        'ordering': ['points_required']
    }

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update badges for all users when a new badge is created
        for user in User.objects:
            self.assign_badges(user)
        return self

    @classmethod
    def assign_badges(cls, user):
        """Assign all badges user qualifies for based on points"""
        try:
            all_badges = cls.objects.order_by('points_required')
            user.badges = []
            
            for badge in all_badges:
                if user.points >= badge.points_required:
                    user.badges.append({
                        'id': str(badge.id),
                        'name': badge.name,
                        'title': badge.title,
                        'image_url': badge.image_url,
                        'points_required': badge.points_required
                    })
            
            user.save()
            return user
        except Exception as e:
            print(f"Error assigning badges: {e}")
            return None