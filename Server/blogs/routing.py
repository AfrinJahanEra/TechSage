from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Real-time blog creation content
    re_path(r'ws/blogs/create/$', consumers.BlogCreateConsumer.as_asgi()),

    # Real-time blog update content
    re_path(r'ws/blogs/update/(?P<blog_id>[^/]+)/$', consumers.BlogUpdateConsumer.as_asgi()),
]
