from django.urls import path
from .views import BadgeAPI, UserBadgesAPI

urlpatterns = [
    path('', BadgeAPI.as_view()),
    path('<str:badge_id>/', BadgeAPI.as_view()),
    path('users/<str:username>/', UserBadgesAPI.as_view()),
]