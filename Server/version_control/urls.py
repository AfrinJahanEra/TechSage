from django.urls import path
from .views import SaveVersion, RevertToVersion, ListVersions

urlpatterns = [
    path('save/<str:blog_id>/', SaveVersion.as_view(), name='save-version'),
    path('revert/<str:blog_id>/<int:version_number>/', RevertToVersion.as_view(), name='revert-version'),
    path('list/<str:blog_id>/', ListVersions.as_view(), name='list-versions'),
]