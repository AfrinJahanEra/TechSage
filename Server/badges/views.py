from rest_framework.views import APIView
from rest_framework.response import Response
from users.models import User
from .models import Badge

class UserBadgeView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            badge = Badge.get_badge(user.points)
            return Response({
                "username": username,
                "points": user.points,
                "badge": badge or {"name": "none", "image_url": None}
            })
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
