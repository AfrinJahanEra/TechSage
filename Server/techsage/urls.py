from django.urls import path, include
from users.views import RegisterUser, LoginUser, GetUser, UserSearch
from blogs.views import (
    CreateBlog, ListBlogs, GetBlog, 
    UpdateBlog, GetBlogVersions, 
    RevertBlogVersion, DeleteBlog,
    ModeratorDeleteBlog, VoteBlog, 
    BlogSearch
)

urlpatterns = [
    path('register/', RegisterUser.as_view()),
    path('login/', LoginUser.as_view()),
    path('user/<str:username>/', GetUser.as_view()),
    
    # Blog URLs - specific endpoints first
    path('blogs/', ListBlogs.as_view()),
    path('blogs/create/', CreateBlog.as_view()),
    path('blogs/search/', BlogSearch.as_view(), name='blog-search'),  # Moved before dynamic URLs
    path('blogs/update/<str:blog_id>/', UpdateBlog.as_view()),
    path('blogs/versions/<str:blog_id>/', GetBlogVersions.as_view()),
    path('blogs/revert/<str:blog_id>/<int:version_number>/', RevertBlogVersion.as_view()),
    path('blogs/delete/<str:blog_id>/', DeleteBlog.as_view()),
    path('blogs/mod/delete/<str:blog_id>/', ModeratorDeleteBlog.as_view()),
    path('blogs/vote/<str:blog_id>/', VoteBlog.as_view()),
    path('blogs/<str:blog_id>/', GetBlog.as_view()),  # Moved to last
    
    path('users/search/', UserSearch.as_view(), name='user-search'),
    path('comments/', include('comments.urls')),
]