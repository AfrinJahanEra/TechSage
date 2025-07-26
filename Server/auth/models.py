import random
from mongoengine import Document, StringField, DateTimeField, BooleanField, IntField
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings  # Confirm this import is present
from datetime import timedelta

class OTP(Document):
    email = StringField(required=True, unique=False)
    otp_code = StringField(max_length=6, required=True)
    created_at = DateTimeField(default=timezone.now)
    is_verified = BooleanField(default=False)
    attempts = IntField(default=0)
    last_attempt = DateTimeField(null=True)

    meta = {
        'collection': 'otps',
        'indexes': [
            {'fields': ['email'], 'unique': False},
            {'fields': ['created_at'], 'expireAfterSeconds': settings.OTP_VALIDITY_MINUTES * 60}
        ]
    }

    @classmethod
    def generate_otp(cls, email):
        # Check for recent valid OTP
        recent_otp = cls.objects(
            email=email,
            created_at__gte=timezone.now() - timedelta(minutes=settings.OTP_VALIDITY_MINUTES),
            is_verified=False
        ).first()

        if recent_otp:
            return recent_otp

        # Delete expired or used OTPs for this email
        cls.objects(email=email).delete()

        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))

        # Create and save OTP
        otp = cls(email=email, otp_code=otp_code)
        otp.save()

        # Send OTP via email
        try:
            send_mail(
                'Your Verification OTP',
                f'Your OTP code is: {otp_code}\nThis code will expire in {settings.OTP_VALIDITY_MINUTES} minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            otp.delete()
            raise Exception(f"Failed to send email: {str(e)}")

        return otp

    def is_valid(self):
        time_elapsed = timezone.now() - self.created_at
        return (time_elapsed.total_seconds() < settings.OTP_VALIDITY_MINUTES * 60) and not self.is_verified

    def record_attempt(self):
        self.attempts += 1
        self.last_attempt = timezone.now()
        self.save()

    def verify(self, submitted_code):
        if not self.is_valid():
            return False, "OTP expired or already verified"
        if self.attempts >= 5 and self.last_attempt and \
           (timezone.now() - self.last_attempt).total_seconds() < 300:
            return False, "Too many attempts. Please try again later."
        self.record_attempt()
        if self.otp_code == submitted_code:
            self.is_verified = True
            self.save()
            return True, "OTP verified successfully"
        return False, "Invalid OTP code"