
from django.urls import path
from .views import check_plagiarism

urlpatterns = [
    path('plagiarism/<str:blog_id>/', check_plagiarism, name='check-plagiarism'),
]
