from django.urls import path
from django.views.generic import TemplateView
from .views import AssignBadgeView, UserBadgeView

urlpatterns = [
    path('assign/', AssignBadgeView.as_view()),
    path('user/<str:username>/', UserBadgeView.as_view()),
    path('admin-panel/', TemplateView.as_view(template_name='badges/assign_badge.html')),
]
