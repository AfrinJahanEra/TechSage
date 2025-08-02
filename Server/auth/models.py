import random
from django.db import models
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta

class OTP(models.Model):
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    last_attempt = models.DateTimeField(null=True, blank=True)

    @classmethod
    def generate_otp(cls, email):
        # Check if recent OTP exists and is still valid
        recent_otp = cls.objects.filter(
            email=email,
            created_at__gte=timezone.now() - timedelta(minutes=settings.OTP_VALIDITY_MINUTES),
            is_verified=False
        ).first()

        if recent_otp:
            return recent_otp  # Return existing OTP if still valid

        # Delete any existing OTPs for this email
        cls.objects.filter(email=email).delete()
        
        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Create and save OTP record
        otp = cls.objects.create(email=email, otp_code=otp_code)
        
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
            
        # Check attempt rate limiting (max 5 attempts)
        if self.attempts >= 5 and self.last_attempt and \
           (timezone.now() - self.last_attempt).total_seconds() < 300:  # 5 minutes cooldown
            return False, "Too many attempts. Please try again later."
            
        self.record_attempt()
        
        if self.otp_code == submitted_code:
            self.is_verified = True
            self.save()
            return True, "OTP verified successfully"
        return False, "Invalid OTP code"