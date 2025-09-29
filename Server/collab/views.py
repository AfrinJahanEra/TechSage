from django.shortcuts import render
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import pytz
import logging

# Import models properly for MongoEngine
from .models import AuthorRequest
from users.models import User
from blogs.models import Blog

class RequestAuthor(APIView):
    def post(self, request):
        try:
            data = request.data
            username = data.get('username')  
            requested_username = data.get('requested_username') 
            blog_id = data.get('blog_id')

            if not all([username, requested_username, blog_id]):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            # Use .get() method for MongoEngine documents
            try:
                user = User.objects.get(username=username)
                requested_user = User.objects.get(username=requested_username)
                blog = Blog.objects.get(id=blog_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            except Blog.DoesNotExist:
                return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)

            # Check if user is an author of the blog
            user_is_author = False
            for author in blog.authors:
                if str(author.id) == str(user.id):
                    user_is_author = True
                    break
            
            if not user_is_author:
                return Response({"error": "You must be an author to request collaborators"}, 
                              status=status.HTTP_403_FORBIDDEN)

            # Check if requested user is already an author
            user_already_author = False
            for author in blog.authors:
                if str(author.id) == str(requested_user.id):
                    user_already_author = True
                    break
            
            if user_already_author:
                return Response({"error": "User is already an author of this blog"}, 
                              status=status.HTTP_400_BAD_REQUEST)

            # Check for existing pending requests
            existing_requests = AuthorRequest.objects(
                blog=blog,
                requested_author=requested_user,
                status='pending'
            )
            
            if existing_requests.count() > 0:
                return Response({"error": "There's already a pending request for this user"}, 
                              status=status.HTTP_400_BAD_REQUEST)

            # Create new author request
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

        except Exception as e:
            logging.error(f"Error in RequestAuthor: {str(e)}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

            # Get the author request
            try:
                author_request = AuthorRequest.objects.get(id=request_id)
            except:
                return Response({"error": "Author request not found"}, status=status.HTTP_404_NOT_FOUND)

            # Get the user
            try:
                user = User.objects.get(username=username)
            except:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            # Check authorization
            if str(user.id) != str(author_request.requested_author.id):
                return Response({"error": "You are not authorized to respond to this request"}, 
                              status=status.HTTP_403_FORBIDDEN)

            # Check if request is still pending
            if author_request.status != 'pending':
                return Response({"error": "This request has already been processed"}, 
                              status=status.HTTP_400_BAD_REQUEST)

            blog = author_request.blog

            if response == 'accept':
                # Add user as author if not already
                user_already_author = False
                for author in blog.authors:
                    if str(author.id) == str(user.id):
                        user_already_author = True
                        break
                
                if not user_already_author:
                    blog.authors.append(user)
                    blog.save()

                author_request.status = 'accepted'
                author_request.save()

                # Get list of author usernames
                author_usernames = []
                for author in blog.authors:
                    author_usernames.append(author.username)

                return Response({
                    "message": "Author request accepted",
                    "blog_id": str(blog.id),
                    "authors": author_usernames
                })

            else:  # reject
                author_request.status = 'rejected'
                author_request.save()

                requesting_author_name = "Unknown User"
                if author_request.requesting_author:
                    requesting_author_name = getattr(author_request.requesting_author, 'username', 'Unknown User')

                return Response({
                    "message": "Author request rejected",
                    "notification": f"Your author request was rejected by {user.username}",
                    "requesting_author": requesting_author_name
                }, status=status.HTTP_200_OK)

        except Exception as e:
            logging.error(f"Error in RespondToAuthorRequest: {str(e)}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetAuthorRequests(APIView):
    def get(self, request, username):
        try:
            # Get the user
            try:
                user = User.objects.get(username=username)
            except:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            dhaka_tz = pytz.timezone('Asia/Dhaka')  # Define Asia/Dhaka timezone
            requests = AuthorRequest.objects(
                requested_author=user,
                status='pending'
            )
            
            requests_data = []
            for req in requests:
                # Safely get blog title with fallback
                blog_title = "Untitled Blog"
                if req.blog:
                    blog_title = getattr(req.blog, 'title', 'Untitled Blog')
                
                # Safely get requesting author username with fallback
                requesting_author = "Unknown User"
                if req.requesting_author:
                    requesting_author = getattr(req.requesting_author, 'username', 'Unknown User')
                
                # Convert created_at to Asia/Dhaka timezone
                created_at_dhaka = req.created_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)
                
                requests_data.append({
                    "request_id": str(req.id),
                    "blog_id": str(req.blog.id) if req.blog else None,
                    "blog_title": blog_title,
                    "requesting_author": requesting_author,
                    "created_at": created_at_dhaka.isoformat(),
                    "timezone": "Asia/Dhaka (UTC+6)"  # Indicate timezone
                })
            
            return Response({
                "count": len(requests_data),
                "requests": requests_data
            })
            
        except Exception as e:
            logging.error(f"Error in GetAuthorRequests: {str(e)}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RemoveAuthor(APIView):
    def post(self, request, blog_id):
        pass