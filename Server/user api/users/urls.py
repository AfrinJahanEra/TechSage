from django.urls import path
from .views import RegisterUser, GetUser, UpdateUser, DeleteUser, LoginUser

urlpatterns = [
    path('register/', RegisterUser.as_view()),
    path('login/', LoginUser.as_view()),
    path('<str:user_id>/', GetUser.as_view()),
    path('<str:user_id>/update/', UpdateUser.as_view()),
    path('<str:user_id>/delete/', DeleteUser.as_view()),
]
