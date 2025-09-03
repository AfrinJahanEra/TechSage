from django.http import JsonResponse
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
import json


class IsolatedGetComments(APIView):
    def get(self, request, blog_id):
        """
        Get comments using direct MongoDB queries to avoid MongoEngine field conflicts
        """
        try:
            from mongoengine.connection import get_db
            import bson
            
            db = get_db()
            comments_collection = db['comment']
            users_collection = db['user']
            
            # Convert string ID to ObjectId
            try:
                blog_object_id = bson.ObjectId(blog_id)
            except bson.errors.InvalidId:
                return Response({"error": "Invalid blog ID"}, status=400)
            
            # Find comments for this blog
            comments_query = {
                'blog': blog_object_id,
                'is_deleted': False
            }
            
            comments_cursor = comments_collection.find(comments_query).sort('created_at', -1)
            comments_list = []
            
            for comment_doc in comments_cursor:
                # Get author info
                author_info = {"username": "Unknown", "avatar_url": None}
                if 'author' in comment_doc:
                    author = users_collection.find_one({'_id': comment_doc['author']})
                    if author:
                        author_info = {
                            "username": author.get('username', 'Unknown'),
                            "avatar_url": author.get('avatar_url')
                        }
                
                # Get parent comment info if exists
                parent_id = None
                if comment_doc.get('parent'):
                    parent_id = str(comment_doc['parent'])
                
                # Format comment
                comment_data = {
                    "id": str(comment_doc['_id']),
                    "blog": str(comment_doc.get('blog', '')),
                    "author": author_info,
                    "content": comment_doc.get('content', ''),
                    "parent": parent_id,
                    "created_at": comment_doc.get('created_at').isoformat() if comment_doc.get('created_at') else None,
                    "updated_at": comment_doc.get('updated_at').isoformat() if comment_doc.get('updated_at') else None,
                    "likes": len(comment_doc.get('likes', [])),
                    "dislikes": len(comment_doc.get('dislikes', [])),
                    "is_deleted": comment_doc.get('is_deleted', False),
                    "is_reviewed": comment_doc.get('is_reviewed', False)
                }
                comments_list.append(comment_data)
            
            return Response({
                "success": True,
                "comments": comments_list,
                "count": len(comments_list)
            })
            
        except Exception as e:
            import traceback
            return Response({
                "success": False,
                "error": str(e),
                "traceback": traceback.format_exc()
            }, status=500)


class IsolatedPostComment(APIView):
    def post(self, request):
        """
        Post comment using direct MongoDB queries to avoid MongoEngine field conflicts
        """
        try:
            from mongoengine.connection import get_db
            import bson
            from datetime import datetime
            
            data = request.data
            db = get_db()
            comments_collection = db['comment']
            blogs_collection = db['blogs']
            users_collection = db['user']
            
            # Validate required fields
            if not data.get('blog_id') or not data.get('author') or not data.get('content'):
                return Response({"error": "Missing required fields: blog_id, author, content"}, status=400)
            
            # Convert and validate blog ID
            try:
                blog_object_id = bson.ObjectId(data['blog_id'])
            except bson.errors.InvalidId:
                return Response({"error": "Invalid blog ID"}, status=400)
            
            # Check if blog exists
            blog = blogs_collection.find_one({'_id': blog_object_id, 'is_deleted': False})
            if not blog:
                return Response({"error": "Blog not found"}, status=404)
            
            # Check if author exists
            author = users_collection.find_one({'username': data['author']})
            if not author:
                return Response({"error": "Author not found"}, status=404)
            
            # Handle parent comment if provided
            parent_object_id = None
            if data.get('parent_id'):
                try:
                    parent_object_id = bson.ObjectId(data['parent_id'])
                    parent_comment = comments_collection.find_one({'_id': parent_object_id})
                    if not parent_comment:
                        return Response({"error": "Parent comment not found"}, status=404)
                except bson.errors.InvalidId:
                    return Response({"error": "Invalid parent comment ID"}, status=400)
            
            # Create comment document
            comment_doc = {
                'blog': blog_object_id,
                'author': author['_id'],
                'content': data['content'],
                'parent': parent_object_id,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'likes': [],
                'dislikes': [],
                'is_deleted': False,
                'is_reviewed': False,
                'reviewed_by': None
            }
            
            # Insert comment
            result = comments_collection.insert_one(comment_doc)
            
            # Return formatted response
            return Response({
                "success": True,
                "comment": {
                    "id": str(result.inserted_id),
                    "blog": str(blog_object_id),
                    "author": {
                        "username": author['username'],
                        "avatar_url": author.get('avatar_url')
                    },
                    "content": data['content'],
                    "parent": str(parent_object_id) if parent_object_id else None,
                    "created_at": comment_doc['created_at'].isoformat(),
                    "updated_at": comment_doc['updated_at'].isoformat(),
                    "likes": 0,
                    "dislikes": 0,
                    "is_deleted": False,
                    "is_reviewed": False
                }
            }, status=201)
            
        except Exception as e:
            import traceback
            return Response({
                "success": False,
                "error": str(e),
                "traceback": traceback.format_exc()
            }, status=500)


class IsolatedLikeComment(APIView):
    def post(self, request, comment_id):
        """
        Like/unlike comment using direct MongoDB queries
        """
        try:
            from mongoengine.connection import get_db
            import bson
            
            data = request.data
            db = get_db()
            comments_collection = db['comment']
            users_collection = db['user']
            
            if not data.get('username'):
                return Response({"error": "Username required"}, status=400)
            
            # Convert comment ID
            try:
                comment_object_id = bson.ObjectId(comment_id)
            except bson.errors.InvalidId:
                return Response({"error": "Invalid comment ID"}, status=400)
            
            # Find user
            user = users_collection.find_one({'username': data['username']})
            if not user:
                return Response({"error": "User not found"}, status=404)
            
            # Find comment
            comment = comments_collection.find_one({'_id': comment_object_id})
            if not comment:
                return Response({"error": "Comment not found"}, status=404)
            
            user_id = user['_id']
            likes = comment.get('likes', [])
            dislikes = comment.get('dislikes', [])
            
            # Toggle like
            if user_id in likes:
                # Remove like
                likes.remove(user_id)
            else:
                # Add like and remove dislike if exists
                likes.append(user_id)
                if user_id in dislikes:
                    dislikes.remove(user_id)
            
            # Update comment
            comments_collection.update_one(
                {'_id': comment_object_id},
                {'$set': {'likes': likes, 'dislikes': dislikes}}
            )
            
            return Response({
                "success": True,
                "likes": len(likes),
                "dislikes": len(dislikes)
            })
            
        except Exception as e:
            return Response({
                "success": False,
                "error": str(e)
            }, status=500)
