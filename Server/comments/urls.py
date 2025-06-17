from django.urls import path
from .views import PostComment, GetComments, LikeComment, DislikeComment

urlpatterns = [
    path('post/', PostComment.as_view()),
    path('blog/<str:blog_id>/', GetComments.as_view()),
    path('<str:comment_id>/like/', LikeComment.as_view()),
    path('<str:comment_id>/dislike/', DislikeComment.as_view()),
]
