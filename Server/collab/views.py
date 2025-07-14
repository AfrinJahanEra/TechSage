from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CollaborationRequest
from users.models import User
from blogs.models import Blog

class SendCollabRequest(APIView):
    def post(self, request):
        data = request.data
        sender = User.objects(username=data.get('sender')).first()
        receiver = User.objects(username=data.get('receiver')).first()
        blog = Blog.objects(id=data.get('blog_id')).first()

        if not sender or not receiver or not blog:
            return Response({"error": "Invalid sender, receiver or blog"}, status=400)

        if sender not in blog.authors:
            return Response({"error": "Only blog authors can send collab requests"}, status=403)

        CollaborationRequest(
            sender=sender,
            receiver=receiver,
            blog=blog,
            message=data.get("message", "")
        ).save()

        return Response({"message": "Collaboration request sent"}, status=201)


class GetCollabRequests(APIView):
    def get(self, request, username):
        user = User.objects(username=username).first()
        if not user:
            return Response({"error": "User not found"}, status=404)

        requests = CollaborationRequest.objects(receiver=user, status="pending")
        return Response([r.to_json() for r in requests], safe=False)

class ApproveRequest(APIView):
    def post(self, request, request_id):
        req = CollaborationRequest.objects(id=request_id).first()
        if not req:
            return Response({"error": "Request not found"}, status=404)

        if req.status != "pending":
            return Response({"error": "Already handled"}, status=400)

        blog = req.blog
        if req.receiver not in blog.authors:
            blog.authors.append(req.receiver)
            blog.save()

        req.status = "accepted"
        req.save()
        return Response({"message": "Collaboration accepted and added to blog"})