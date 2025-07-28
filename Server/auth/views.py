from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import OTP
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def send_otp(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        otp = OTP.generate_otp(email)
        logger.info(f"OTP sent to {email}")
        return Response({
            'message': 'OTP sent successfully',
            'expires_in': f"{otp.OTP_VALIDITY_MINUTES} minutes"
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Failed to send OTP to {email}: {str(e)}")
        return Response({
            'error': 'Failed to send OTP',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    otp_code = request.data.get('otp_code')
    
    if not email or not otp_code:
        return Response({
            'error': 'Email and OTP code are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        otp = OTP.objects.filter(email=email).order_by('-created_at').first()
        if not otp:
            return Response({
                'error': 'No OTP found for this email. Please request a new OTP.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        is_valid, message = otp.verify(otp_code)
        if is_valid:
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