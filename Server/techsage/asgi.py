import os
from channels.routing import get_default_application
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "techsage.settings")
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
import comments.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter(comments.routing.websocket_urlpatterns),
})
