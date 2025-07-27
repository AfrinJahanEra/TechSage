from django.apps import AppConfig

class CustomAuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'auth'  # Directory name
    label = 'custom_auth'  # Unique label to avoid conflict