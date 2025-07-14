from django.urls import path
from .views import SendCollabRequest, GetCollabRequests

urlpatterns = [
    path("send/", SendCollabRequest.as_view()),
    path("inbox/<str:username>/", GetCollabRequests.as_view()),
]