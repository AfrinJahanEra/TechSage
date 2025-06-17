from django.urls import path
from .views import PostComment, GetComments

urlpatterns = [
    path('post/', PostComment.as_view()),
    path('blog/<str:blog_id>/', GetComments.as_view()),
]
