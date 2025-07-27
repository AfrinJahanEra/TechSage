from django.urls import path
from .views import UserBadgeView

urlpatterns = [
    path('badge/<str:username>/', UserBadgeView.as_view(), name='user-badge'),
]
