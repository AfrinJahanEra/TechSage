# from rest_framework import serializers
# from .models import OTP

# class OTPSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = OTP
#         fields = ['email', 'otp']

# class OTPSendSerializer(serializers.Serializer):
#     email = serializers.EmailField()

# class OTPVerifySerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     otp = serializers.CharField(max_length=6)