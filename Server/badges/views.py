from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from .models import Badge, UserBadge
from django.core.exceptions import ValidationError

class AssignBadgeView(APIView):
    def post(self, request):
        username = request.data.get("username")
        badge_name = request.data.get("badge")

        if not username or not badge_name:
            return Response({"error": "username and badge are required"}, status=400)

        try:
            user = User.objects.get(username=username)
            badge = Badge.objects.get(name=badge_name)

            user_badge, _ = UserBadge.objects.get_or_create(user=user)
            user_badge.badge = badge
            user_badge.clean() 
            user_badge.save()

            return Response({
                "message": f"{badge.name.title()} badge assigned to {username}",
                "badge": {
                    "name": badge.name,
                    "image_url": badge.image_url
                }
            })

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Badge.DoesNotExist:
            return Response({"error": "Badge not found"}, status=404)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

class UserBadgeView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            user_badge = UserBadge.objects.filter(user=user).first()
            if user_badge:
                return Response({
                    "username": username,
                    "points": user.points,
                    "badge": {
                        "name": user_badge.badge.name,
                        "image_url": user_badge.badge.image_url
                    }
                })
            else:
                return Response({
                    "username": username,
                    "points": user.points,
                    "badge": {"name": "none", "image_url": None}
                })

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

