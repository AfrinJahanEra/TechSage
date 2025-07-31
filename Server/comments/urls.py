from django.urls import path
from .views import GetCommentsByBlog
from .views import PostComment, GetComments, LikeComment, DeleteComment, GetAllComments, ReviewComment

urlpatterns = [
    path('post/', PostComment.as_view()),
    # path('blog/<str:blog_id>/', GetComments.as_view()),
    path('<str:comment_id>/like/', LikeComment.as_view()),
    path('<str:comment_id>/delete/', DeleteComment.as_view()),
    path('all/', GetAllComments.as_view()),  # New endpoint
    path('<str:comment_id>/review/', ReviewComment.as_view()),
    path('blog/<str:blog_id>/', GetCommentsByBlog.as_view(), name='comments-by-blog'),
]
