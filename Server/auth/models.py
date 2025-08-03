import random
from mongoengine import Document, StringField, DateTimeField, BooleanField, IntField
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
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

        recent_otp = cls.objects(
            email=email,
            created_at__gte=timezone.now() - timedelta(minutes=settings.OTP_VALIDITY_MINUTES),
            is_verified=False
        ).first()

        if recent_otp:
            return recent_otp


        cls.objects(email=email).delete()


        otp_code = str(random.randint(100000, 999999))


        otp = cls(email=email, otp_code=otp_code, created_at=timezone.now())
        otp.save()


        try:
            send_mail(
                subject='Your TechSage Verification OTP',
                message=(
                    f'Hello,\n\n'
                    f'Your OTP code for TechSage account verification is: {otp_code}\n'
                    f'This code will expire in {settings.OTP_VALIDITY_MINUTES} minutes.\n\n'
                    f'Please do not reply to this email, as it is sent from an unmonitored address.\n'
                    f'For support, visit https://techsage.com/support.\n\n'
                    f'Thank you,\nTechSage Team'
                ),
                from_email=None, 
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            otp.delete()
            raise Exception(f"Failed to send email: {str(e)}")

        return otp

    def is_valid(self):
        created_at = self.created_at
        if not created_at.tzinfo:
            created_at = timezone.make_aware(created_at, timezone=timezone.get_current_timezone())
        time_elapsed = timezone.now() - created_at
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