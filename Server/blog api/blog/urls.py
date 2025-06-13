from django.urls import path
from . import views

urlpatterns = [
    path('', views.blog_list),
    path('create/', views.create_blog),
    path('<str:id>/', views.blog_detail),
    path('<str:id>/update/', views.update_blog),
    path('<str:id>/delete/', views.delete_blog),
]
