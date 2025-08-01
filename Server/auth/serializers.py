from rest_framework import serializers

class OTPSendSerializer(serializers.Serializer):
    email = serializers.EmailField()

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
