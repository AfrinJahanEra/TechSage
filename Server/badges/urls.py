from django.urls import path
from .views import BadgeListView, BadgeDetailView, AssignBadgeView, UserBadgesView

urlpatterns = [
    path('', BadgeListView.as_view(), name='badge-list'),
    path('<str:badge_id>/', BadgeDetailView.as_view(), name='badge-detail'),
    path('assign/', AssignBadgeView.as_view(), name='assign-badge'),
    path('user/<str:username>/', UserBadgesView.as_view(), name='user-badges'),
]