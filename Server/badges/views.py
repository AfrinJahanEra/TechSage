from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from .models import Badge
from users.models import User
import cloudinary.uploader
import os
from dotenv import load_dotenv
import logging
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
load_dotenv()
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Ensure debug level is set

class BadgeAPI(APIView):
    parser_classes = (MultiPartParser,)

    def get(self, request, badge_id=None):
        try:
            if badge_id:
                badge = Badge.objects.get(id=badge_id)
                return Response({
                    'id': str(badge.id),
                    'name': badge.name,
                    'image_url': badge.image_url,
                    'points_required': badge.points_required,
                    'title': badge.title
                })
            else:
                badges = Badge.objects.all()
                return Response([{
                    'id': str(badge.id),
                    'name': badge.name,
                    'image_url': badge.image_url,
                    'points_required': badge.points_required,
                    'title': badge.title
                } for badge in badges])
        except Badge.DoesNotExist:
            return Response({'error': 'Badge not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            # Validate required fields
            required_fields = ['name', 'title', 'points_required', 'image']
            if not all(field in request.data for field in required_fields):
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

            # Debug upload preset
            upload_preset = os.getenv('CLOUDINARY_UPLOAD_PRESET')
            logger.debug(f"Environment variables loaded: {dict(os.environ)}")
            logger.debug(f"Attempting upload with preset: {upload_preset}")
            if not upload_preset:
                return Response({'error': 'CLOUDINARY_UPLOAD_PRESET not configured in .env'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Upload image to Cloudinary
            logger.debug(f"Uploading file: {request.FILES['image'].name}")
            result = cloudinary.uploader.upload(
                request.FILES['image'],
                folder="badges",
                upload_preset=upload_preset
            )
            logger.debug(f"Upload result: {result}")

            badge = Badge(
                name=request.data['name'],
                image_url=result['secure_url'],
                points_required=int(request.data['points_required']),
                title=request.data['title'],
                public_id=result.get('public_id')
            )
            badge.save()

            return Response({
                'id': str(badge.id),
                'name': badge.name,
                'image_url': badge.image_url,
                'points_required': badge.points_required,
                'title': badge.title
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Upload error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, badge_id):
        try:
            badge = Badge.objects.get(id=badge_id)
            if badge.public_id:
                cloudinary.uploader.destroy(badge.public_id)
            badge.delete()
            return Response({'message': 'Badge deleted successfully'}, status=status.HTTP_200_OK)
        except Badge.DoesNotExist:
            return Response({'error': 'Badge not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserBadgesAPI(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            return Response(user.badges, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)