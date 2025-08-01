from django.urls import path
from .views import AssignBadgeView, UserBadgeView

urlpatterns = [
    path('assign/', AssignBadgeView.as_view()),
    path('user/<str:username>/', UserBadgeView.as_view()),
]
