from django.urls import path
from .views import BadgeAPIView, BadgeDetailAPIView, UserBadgeAPIView, AssignBadgeAPIView

urlpatterns = [
    path('', BadgeAPIView.as_view()),
    path('<str:badge_id>/', BadgeDetailAPIView.as_view()),
    path('user/<str:username>/', UserBadgeAPIView.as_view()),
    path('assign/', AssignBadgeAPIView.as_view()),
]