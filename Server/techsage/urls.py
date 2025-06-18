from django.urls import path,include
from users.views import RegisterUser, LoginUser
from blogs.views import CreateBlog, ListBlogs

urlpatterns = [
    path('register/', RegisterUser.as_view()),
    path('login/', LoginUser.as_view()),
    path('create-blog/', CreateBlog.as_view()),
    path('blogs/', ListBlogs.as_view()),
    path('comments/', include('comments.urls')),
]
