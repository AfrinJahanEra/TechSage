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
            'name': b.name,
            'image_url': b.image_url,
            'points_required': b.points_required,
            'title': b.title
        } for b in badges])

    def post(self, request):
        try:
            # Upload image to Cloudinary
            result = cloudinary.uploader.upload(
                request.FILES['image'],
                folder="badges"
            )
            
            badge = Badge(
                name=request.data['level'],  # ruby, bronze, etc.
                image_url=result['secure_url'],
                points_required=int(request.data['points']),
                title=request.data['title']
            ).save()
            
            return Response({
                'name': badge.name,
                'image': badge.image_url,
                'points': badge.points_required,
                'title': badge.title
            }, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class UserBadgesAPI(APIView):
    def get(self, request, username):
        user = User.objects.get(username=username)
        badges = Badge.objects(name__in=user.badges)
        return Response([{
            'name': b.name,
            'image_url': b.image_url,
            'title': b.title
        } for b in badges])