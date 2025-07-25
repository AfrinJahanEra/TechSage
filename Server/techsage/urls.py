from django.urls import path, include
from django.urls import path
from django.contrib import admin
from django.urls import path, include
from users.views import (
    RegisterUser,
    LoginUser,
    UserProfile,
    UserSearch,
    SavedBlogsAPI,
    UserListByRole
)
from blogs.views import (
    CreateBlog, ListBlogs, GetBlog, 
    UpdateBlog, GetBlogVersions, 
    RevertBlogVersion, DeleteBlog,
    ModeratorDeleteBlog, VoteBlog, 
    BlogSearch, PublishBlog, UnpublishBlog,
    SaveAsDraft, RestoreBlog, AddAuthorToBlog,JobBlogs,
    PublishedBlogs,ReviewBlog, CreateDraft, UpdateDraft
)



urlpatterns = [
    path('users/by-role/', UserListByRole.as_view(), name='users-by-role'),
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', LoginUser.as_view(), name='login'),
    path('user/<str:username>/', UserProfile.as_view(), name='user-profile'),
    path('user/<str:username>/saved-blogs/', SavedBlogsAPI.as_view(), name='saved-blogs'),
    path('search/', UserSearch.as_view(), name='user-search'),

    path('blogs/', ListBlogs.as_view()),
    path('blogs/create/', CreateBlog.as_view()),
    
    path('blogs/publish/<str:blog_id>/', PublishBlog.as_view()),
    path('blogs/unpublish/<str:blog_id>/', UnpublishBlog.as_view()),
    path('blogs/draft/<str:blog_id>/', SaveAsDraft.as_view()),
    path('blogs/restore/<str:blog_id>/', RestoreBlog.as_view()),
    
    path('blogs/add-author/<str:blog_id>/', AddAuthorToBlog.as_view()),
    
    path('blogs/search/', BlogSearch.as_view(), name='blog-search'),
    
    path('blogs/versions/<str:blog_id>/', GetBlogVersions.as_view()),
    path('blogs/revert/<str:blog_id>/<int:version_number>/', RevertBlogVersion.as_view()),
    
    path('blogs/update/<str:blog_id>/', UpdateBlog.as_view()),
    path('blogs/create-draft/', CreateDraft.as_view(), name='create-draft'),
    path('blogs/update-draft/<str:blog_id>/', UpdateDraft.as_view(), name='update-draft'),
    
    path('blogs/delete/<str:blog_id>/', DeleteBlog.as_view()),
    path('blogs/mod/delete/<str:blog_id>/', ModeratorDeleteBlog.as_view()),

    path('blogs/vote/<str:blog_id>/', VoteBlog.as_view(), name='vote-blog'),
    

    path('blogs/', ListBlogs.as_view()),  
    path('jobs/', JobBlogs.as_view()),

    path('admin/', admin.site.urls),
    path('api/auth/', include('auth.urls')),

    
    path('blogs/<str:blog_id>/', GetBlog.as_view()),
    path('published-blogs/', PublishedBlogs.as_view(), name='published_blogs'),#for all blogs of all ids
    path('blogs/review/<str:blog_id>/', ReviewBlog.as_view(), name='review-blog'),


    

    path('collaboration-request/',include('collab.urls')),
    path('checker/',include('checker.urls')),

    path('comments/', include('comments.urls')),
    
    path('reports/', include('reports.urls')),

    path('', include('checker.urls')),
]
