from django.urls import path, include
from django.urls import path
from users.views import (
    RegisterUser,
    LoginUser,
    UserProfile,
    UserSearch,
    SavedBlogsAPI
)
from blogs.views import (
    CreateBlog, ListBlogs, GetBlog, 
    UpdateBlog, GetBlogVersions, 
    RevertBlogVersion, DeleteBlog,
    ModeratorDeleteBlog, VoteBlog, 
    BlogSearch
)

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', LoginUser.as_view(), name='login'),
    path('user/<str:username>/', UserProfile.as_view(), name='user-profile'),
    path('user/<str:username>/saved-blogs/', SavedBlogsAPI.as_view(), name='saved-blogs'),
    path('search/', UserSearch.as_view(), name='user-search'),
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

    path('comments/', include('comments.urls')),
]