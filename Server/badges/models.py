import mongoengine as me
from users.models import User  # MongoEngine User

class Badge(me.Document):
    name = me.StringField(required=True, unique=True, choices=[
        'ruby', 'bronze', 'sapphire', 'silver', 'gold', 'diamond'
    ])
    image_url = me.StringField(required=True)

    meta = {
        'collection': 'badges'
    }

    def __str__(self):
        return self.name

class UserBadge(me.Document):
    user = me.ReferenceField(User, required=True, unique=True)
    badge = me.ReferenceField(Badge, required=True)

    def clean(self):
        thresholds = {
            "ruby": 100,
            "bronze": 200,
            "sapphire": 350,
            "silver": 300,
            "gold": 400,
            "diamond": 500
        }
        required_points = thresholds[self.badge.name]
        if self.user.points < required_points:
            raise ValueError(f"{self.badge.name.title()} badge requires at least {required_points} points. User has {self.user.points}.")

    def __str__(self):
        return f"{self.user.username} → {self.badge.name}"
