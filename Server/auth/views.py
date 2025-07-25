from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import OTP
from .serializers import OTPSendSerializer, OTPVerifySerializer
import logging
from django.conf import settings
from users.models import User

logger = logging.getLogger(__name__)

class SendOTPView(APIView):
    def post(self, request):
        serializer = OTPSendSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        try:
            otp = OTP.generate_otp(email)
            logger.info(f"OTP sent to {email}")
            return Response({
                'message': 'OTP sent successfully',
                'expires_in': f"{settings.OTP_VALIDITY_MINUTES} minutes"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to send OTP to {email}: {str(e)}")
            return Response({
                'error': 'Failed to send OTP',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyOTPView(APIView):
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']
        
        try:
            otp = OTP.objects(email=email).order_by('-created_at').first()
            if not otp:
                return Response({
                    'error': 'No OTP found for this email. Please request a new OTP.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            is_valid, message = otp.verify(otp_code)
            if is_valid:
                user = User.objects(email=email).first()
                if user:
                    user.is_verified = True
                    user.save()
                logger.info(f"OTP verified for {email}")
                return Response({
                    'message': message,
                    'email_verified': True
                }, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Failed OTP attempt for {email}: {message}")
                return Response({
                    'error': message,
                    'attempts_remaining': max(0, 5 - otp.attempts)
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"OTP verification error for {email}: {str(e)}")
            return Response({
                'error': 'An error occurred during verification',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)