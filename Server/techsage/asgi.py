import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
import comments.routing
import blogs.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'techsage.settings')
django.setup()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter(
        comments.routing.websocket_urlpatterns + 
        blogs.routing.websocket_urlpatterns
    ),
})