from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from .models import Badge, UserBadge
from users.models import User
import datetime
import cloudinary.uploader

class BadgeListView(APIView):
    def get(self, request):
        try:
            badges = Badge.objects.all()
            return Response([{
                "id": str(badge.id),
                "name": badge.name,
                "description": badge.description,
                "image_url": badge.image_url,
                "points_required": badge.points_required,
                "created_at": badge.created_at.isoformat()
            } for badge in badges], status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        try:
            if not request.FILES.get('image'):
                return Response({"error": "Image file is required"}, status=400)

            badge = Badge(
                name=request.data.get('name'),
                description=request.data.get('description'),
                points_required=int(request.data.get('points_required', 0))
            )

            if not badge.upload_image(request.FILES['image']):
                return Response({"error": "Failed to upload badge image"}, status=400)
            
            badge.save()
            return Response({
                "message": "Badge created successfully",
                "badge": {
                    "id": str(badge.id),
                    "name": badge.name,
                    "image_url": badge.image_url
                }
            }, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class BadgeDetailView(APIView):
    def get(self, request, badge_id):
        try:
            badge = Badge.objects.get(id=badge_id)
            return Response({
                "id": str(badge.id),
                "name": badge.name,
                "description": badge.description,
                "image_url": badge.image_url,
                "points_required": badge.points_required,
                "created_at": badge.created_at.isoformat()
            })
        except Badge.DoesNotExist:
            return Response({"error": "Badge not found"}, status=404)

    def put(self, request, badge_id):
        try:
            badge = Badge.objects.get(id=badge_id)
            
            if 'name' in request.data:
                badge.name = request.data['name']
            if 'description' in request.data:
                badge.description = request.data['description']
            if 'points_required' in request.data:
                badge.points_required = int(request.data['points_required'])
            if request.FILES.get('image'):
                if not badge.upload_image(request.FILES['image']):
                    return Response({"error": "Failed to update badge image"}, status=400)
            
            badge.save()
            return Response({
                "message": "Badge updated successfully",
                "badge": {
                    "id": str(badge.id),
                    "name": badge.name,
                    "image_url": badge.image_url
                }
            })
        except Badge.DoesNotExist:
            return Response({"error": "Badge not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    def delete(self, request, badge_id):
        try:
            badge = Badge.objects.get(id=badge_id)
            
            # Delete associated image from Cloudinary
            if badge.image_public_id:
                cloudinary.uploader.destroy(badge.image_public_id)
            
            # Delete badge
            badge.delete()
            
            return Response({"message": "Badge deleted successfully"})
        except Badge.DoesNotExist:
            return Response({"error": "Badge not found"}, status=404)

class AssignBadgeView(APIView):
    def post(self, request):
        try:
            username = request.data.get("username")
            badge_id = request.data.get("badge_id")

            if not username or not badge_id:
                return Response({"error": "username and badge_id are required"}, status=400)

            user = User.objects.get(username=username)
            badge = Badge.objects.get(id=badge_id)

            user_badge = UserBadge(user=user, badge=badge)
            user_badge.save()

            return Response({
                "message": f"{badge.name} badge assigned to {username}",
                "badge": {
                    "name": badge.name,
                    "image_url": badge.image_url
                }
            }, status=201)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Badge.DoesNotExist:
            return Response({"error": "Badge not found"}, status=404)
        except ValidationError as e:
            return Response({"error": str(e)}, status=400)

class UserBadgesView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            user_badges = UserBadge.objects.filter(user=user)
            
            return Response([{
                "id": str(ub.id),
                "badge": {
                    "id": str(ub.badge.id),
                    "name": ub.badge.name,
                    "image_url": ub.badge.image_url,
                    "points_required": ub.badge.points_required
                },
                "awarded_at": ub.awarded_at.isoformat()
            } for ub in user_badges], status=200)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)