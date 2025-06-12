from rest_framework import serializers

class UserSerializer(serializers.Serializer):
    _id = serializers.CharField(read_only=True)
    username = serializers.CharField()
    email = serializers.EmailField()
    bio = serializers.CharField(allow_blank=True, required=False)
    avatar = serializers.CharField(allow_blank=True, required=False)
    password = serializers.CharField(write_only=True)
