from django.urls import path
from .views import BadgeAPI, UserBadgesAPI

urlpatterns = [
    path('', BadgeAPI.as_view()),  # For GET (all badges) and POST
    path('<str:badge_id>/', BadgeAPI.as_view()),  # For GET (single badge) and DELETE
    path('users/<str:username>/', UserBadgesAPI.as_view()),
]