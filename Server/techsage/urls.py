from django.urls import path,include
from users.views import RegisterUser, LoginUser
from blogs.views import CreateBlog, ListBlogs

from django.http import FileResponse
import os

def test_page(request):
    return FileResponse(open(os.path.join("frontend", "index.html"), "rb"))

urlpatterns = [
    path('register/', RegisterUser.as_view()),
    path('login/', LoginUser.as_view()),
    path('create-blog/', CreateBlog.as_view()),
    path('blogs/', ListBlogs.as_view()),
    path('comments/', include('comments.urls')),
]
