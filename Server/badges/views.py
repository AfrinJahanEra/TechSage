from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from users.models import User
from .models import Badge, UserBadge
from django.core.exceptions import ValidationError
import cloudinary.uploader

class BadgeAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        badges = Badge.objects.all()
        return Response([{
            'id': str(badge.id),
            'name': badge.name,
            'image_url': badge.image_url,
            'points_required': badge.points_required,
            'description': badge.description,
            'created_at': badge.created_at.isoformat()
        } for badge in badges])

    def post(self, request):
        try:
            badge_file = request.FILES.get('image')
            
            if not badge_file:
                return Response({"error": "Image file is required"}, status=400)

            upload_result = cloudinary.uploader.upload(
                badge_file,
                folder="techsage/badges",
                allowed_formats=['png', 'jpg', 'jpeg', 'svg']
            )

            badge = Badge(
                name=request.data.get('name'),
                image_url=upload_result['secure_url'],
                points_required=int(request.data.get('points_required')),
                description=request.data.get('description', '')
            )
            badge.save()

            return Response({
                "id": str(badge.id),
                "name": badge.name,
                "image_url": badge.image_url,
                "points_required": badge.points_required
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=400)

class BadgeDetailAPIView(APIView):
    def delete(self, request, badge_id):
        try:
            badge = Badge.objects.get(id=badge_id)
            
            # Delete image from Cloudinary
            if badge.image_url:
                public_id = badge.image_url.split('/')[-1].split('.')[0]
                cloudinary.uploader.destroy(f"techsage/badges/{public_id}")
            
            badge.delete()
            return Response({"message": "Badge deleted successfully"})
        except Badge.DoesNotExist:
            return Response({"error": "Badge not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class UserBadgeAPIView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            user_badges = UserBadge.objects(user=user).order_by('-awarded_at')
            
            return Response([{
                'id': str(ub.id),
                'badge': {
                    'name': ub.badge.name,
                    'image_url': ub.badge.image_url
                },
                'awarded_at': ub.awarded_at.isoformat()
            } for ub in user_badges])
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

class AssignBadgeAPIView(APIView):
    def post(self, request):
        username = request.data.get("username")
        
        if not username:
            return Response({"error": "username is required"}, status=400)

        try:
            user = User.objects.get(username=username)
            user_badge = UserBadge.assign_appropriate_badge(user)
            
            if user_badge:
                return Response({
                    "message": f"Badge {user_badge.badge.name} assigned to {username}",
                    "badge": {
                        "name": user_badge.badge.name,
                        "image_url": user_badge.badge.image_url
                    }
                })
            return Response({"message": "No new badge assigned"})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)