from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from .models import Badge
from users.models import User
import cloudinary.uploader

class BadgeAPI(APIView):
    parser_classes = (MultiPartParser,)

    def get(self, request):
        badges = Badge.objects.all()
        return Response([{
            'id': str(badges.id),
            'name': badges.name,
            'image_url': badges.image_url,
            'points_required': badges.points_required,
            'title': badges.title
        } for b in badges])

    def post(self, request):
        try:
            # Upload image to Cloudinary
            result = cloudinary.uploader.upload(
                request.FILES['image'],
                folder="badges"
            )
            
            badge = Badge(
                name=request.data['name'],
                image_url=result['secure_url'],
                points_required=int(request.data['points_required']),
                title=request.data['title']
            ).save()
            
            return Response({
                'id': str(badge.id),
                'name': badge.name,
                'image_url': badge.image_url,
                'points_required': badge.points_required,
                'title': badge.title
            }, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    def delete(self, request, badge_id):
        try:
            badge = Badge.objects.get(id=badge_id)
            badge.delete()
            return Response({'message': 'Badge deleted successfully'}, status=200)
        except Badge.DoesNotExist:
            return Response({'error': 'Badge not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class UserBadgesAPI(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            return Response(user.badges, status=200)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)