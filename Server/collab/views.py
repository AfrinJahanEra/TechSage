from django.shortcuts import render
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Blog, AuthorRequest
from users.models import User
from rest_framework import status


class RequestAuthor(APIView):
    def post(self, request):
        try:
            data = request.data
            username = data.get('username')  
            requested_username = data.get('requested_username') 
            blog_id = data.get('blog_id')

            if not all([username, requested_username, blog_id]):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)


            user = User.objects.get(username=username)
            requested_user = User.objects.get(username=requested_username)
            blog = Blog.objects.get(id=blog_id)


            if user not in blog.authors:
                return Response({"error": "You must be an author to request collaborators"}, 
                              status=status.HTTP_403_FORBIDDEN)


            if requested_user in blog.authors:
                return Response({"error": "User is already an author of this blog"}, 
                              status=status.HTTP_400_BAD_REQUEST)

 
            existing_request = AuthorRequest.objects(
                blog=blog,
                requested_author=requested_user,
                status='pending'
            ).first()

            if existing_request:
                return Response({"error": "There's already a pending request for this user"}, 
                              status=status.HTTP_400_BAD_REQUEST)

      
            author_request = AuthorRequest(
                blog=blog,
                requested_author=requested_user,
                requesting_author=user,
                status='pending'
            )
            author_request.save()

            return Response({
                "message": "Author request sent successfully",
                "request_id": str(author_request.id)
            }, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Blog.DoesNotExist:
            return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RespondToAuthorRequest(APIView):
    def post(self, request, request_id):
        try:
            data = request.data
            username = data.get('username')  
            response = data.get('response')

            if not all([username, response]):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            if response not in ['accept', 'reject']:
                return Response({"error": "Response must be either 'accept' or 'reject'"}, 
                              status=status.HTTP_400_BAD_REQUEST)


            author_request = AuthorRequest.objects.get(id=request_id)
            user = User.objects.get(username=username)

     
            if user != author_request.requested_author:
                return Response({"error": "You are not authorized to respond to this request"}, 
                              status=status.HTTP_403_FORBIDDEN)

     
            if author_request.status != 'pending':
                return Response({"error": "This request has already been processed"}, 
                              status=status.HTTP_400_BAD_REQUEST)

            blog = author_request.blog

            if response == 'accept':
     
                if user not in blog.authors:
                    blog.authors.append(user)
                    blog.save()

                author_request.status = 'accepted'
                author_request.save()

                return Response({
                    "message": "Author request accepted",
                    "blog_id": str(blog.id),
                    "authors": [author.username for author in blog.authors]
                })

            else: 
                author_request.status = 'rejected'
                author_request.save()


                return Response({
                    "message": "Author request rejected",
                    "notification": f"Your author request was rejected by {user.username}"
                }, status=status.HTTP_200_OK)

        except AuthorRequest.DoesNotExist:
            return Response({"error": "Author request not found"}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetAuthorRequests(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            
       
            requests = AuthorRequest.objects(
                requested_author=user,
                status='pending'
            )
            
            requests_data = []
            for req in requests:
                requests_data.append({
                    "request_id": str(req.id),
                    "blog_id": str(req.blog.id),
                    "blog_title": req.blog.title,
                    "requesting_author": req.requesting_author.username,
                    "created_at": req.created_at.isoformat()
                })
            
            return Response({
                "count": len(requests_data),
                "requests": requests_data
            })
            
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RemoveAuthor(APIView):
    def post(self, request, blog_id):
  
        pass