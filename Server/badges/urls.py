from django.urls import path
from .views import BadgeAPI, UserBadgesAPI

urlpatterns = [
    path('badges/', BadgeAPI.as_view()),
    path('users/<str:username>/badges/', UserBadgesAPI.as_view()),
]