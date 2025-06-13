from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

urlpatterns = [
    path('', lambda r: JsonResponse({'message': 'Welcome to TechSage API'})),
    path('admin/', admin.site.urls),
    # path('api/users/', include('users.urls')),
    path('api/blogs/', include('blog.urls')),
]
