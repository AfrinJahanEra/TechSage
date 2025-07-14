from django.urls import path, include
from django.urls import path
from .models import AuthorRequest
from .views import (
    RequestAuthor,
    RespondToAuthorRequest,
    GetAuthorRequests
)
urlpatterns = [
    path('request-author/', RequestAuthor.as_view(), name='request-author'),
    path('respond-to-request/<str:request_id>/', RespondToAuthorRequest.as_view(), name='respond-to-author-request'),
    path('author-requests/<str:username>/', GetAuthorRequests.as_view(), name='get-author-requests'),
]