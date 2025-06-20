from django.urls import path,include
from users.views import RegisterUser, LoginUser
from blogs.views import CreateBlog, ListBlogs, UpdateBlog, GetBlogVersions, RevertBlogVersion

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
    path('update-blog/<str:blog_id>/', UpdateBlog.as_view()),
    path('blog-versions/<str:blog_id>/', GetBlogVersions.as_view()),
    path('revert-blog/<str:blog_id>/<int:version_number>/', RevertBlogVersion.as_view()),
]
