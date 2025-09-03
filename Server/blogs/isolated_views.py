from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class IsolatedPublishedBlogs(APIView):
    def get(self, request):
        """
        Completely isolated published blogs endpoint - no MongoEngine imports
        """
        try:
            from mongoengine.connection import get_db
            
            db = get_db()
            collection = db['blogs']
            user_collection = db['user']
            
            # Base query
            query = {
                'is_published': True,
                'is_deleted': False
            }
            
            # Get documents
            cursor = collection.find(query).sort('published_at', -1).limit(10)
            docs = list(cursor)
            
            # Format response
            blogs = []
            for doc in docs:
                # Get authors
                authors = []
                for author_id in doc.get('authors', []):
                    author = user_collection.find_one({'_id': author_id})
                    if author:
                        authors.append({
                            'username': author.get('username'),
                            'avatar': author.get('avatar_url')
                        })
                
                content = doc.get('content', '')
                blogs.append({
                    "id": str(doc['_id']),
                    "title": doc.get('title', ''),
                    "excerpt": content[:200] + "..." if len(content) > 200 else content,
                    "content": content,  # Full content for 200-word preview
                    "authors": authors,
                    "thumbnail_url": doc.get('thumbnail_url'),
                    "categories": doc.get('categories', []),
                    "tags": doc.get('tags', []),
                    "published_at": doc.get('published_at').isoformat() if doc.get('published_at') else None,
                    "stats": {
                        "upvotes": len(doc.get('upvotes', [])),
                        "downvotes": len(doc.get('downvotes', []))
                    }
                })
            
            total = collection.count_documents(query)
            
            return Response({
                "success": True,
                "blogs": blogs,
                "total": total
            })
            
        except Exception as e:
            import traceback
            return Response({
                "success": False,
                "error": str(e),
                "traceback": traceback.format_exc()
            }, status=500)


class IsolatedGetBlog(APIView):
    def get(self, request, blog_id):
        """
        Get individual blog using direct MongoDB queries to avoid MongoEngine field conflicts
        """
        try:
            from mongoengine.connection import get_db
            import bson
            
            db = get_db()
            collection = db['blogs']
            user_collection = db['user']
            
            # Convert string ID to ObjectId
            try:
                object_id = bson.ObjectId(blog_id)
            except bson.errors.InvalidId:
                return Response({"error": "Invalid blog ID"}, status=400)
            
            # Find the blog
            doc = collection.find_one({
                '_id': object_id,
                'is_deleted': False
            })
            
            if not doc:
                return Response({"error": "Blog not found"}, status=404)
            
            # Get authors
            authors = []
            for author_id in doc.get('authors', []):
                author = user_collection.find_one({'_id': author_id})
                if author:
                    authors.append({
                        'username': author.get('username'),
                        'avatar': author.get('avatar_url')
                    })
            
            # Format response
            blog_data = {
                "id": str(doc['_id']),
                "title": doc.get('title', ''),
                "content": doc.get('content', ''),
                "thumbnail_url": doc.get('thumbnail_url'),
                "authors": authors,
                "categories": doc.get('categories', []),
                "tags": doc.get('tags', []),
                "created_at": doc.get('created_at').isoformat() if doc.get('created_at') else None,
                "updated_at": doc.get('updated_at').isoformat() if doc.get('updated_at') else None,
                "status": "published" if doc.get('is_published') else "draft",
                "published_at": doc.get('published_at').isoformat() if doc.get('published_at') else None,
                "upvotes": len(doc.get('upvotes', [])),
                "downvotes": len(doc.get('downvotes', [])),
                "versions": doc.get('current_version', 1),
                "is_draft": doc.get('is_draft', True),
                "is_published": doc.get('is_published', False)
            }
            
            return Response(blog_data)
            
        except Exception as e:
            import traceback
            return Response({
                "error": str(e),
                "traceback": traceback.format_exc()
            }, status=500)


class IsolatedJobBlogs(APIView):
    """
    Get job blogs using direct MongoDB queries to avoid MongoEngine field conflicts
    """
    def get(self, request):
        try:
            from mongoengine.connection import get_db
            import pytz
            
            db = get_db()
            dhaka_tz = pytz.timezone('Asia/Dhaka')
            
            # Direct MongoDB query for job blogs
            job_blogs = list(db.blog.find({
                "categories": {"$in": ["job"]},
                "is_published": True,
                "is_deleted": False
            }).sort("created_at", -1))
            
            blogs_list = []
            for doc in job_blogs:
                created_at = doc.get('created_at')
                updated_at = doc.get('updated_at')
                
                if created_at:
                    created_at_dhaka = created_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)
                if updated_at:
                    updated_at_dhaka = updated_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz)
                
                # Get author details
                authors = []
                for author_id in doc.get('authors', []):
                    author_doc = db.user.find_one({"_id": author_id})
                    if author_doc:
                        authors.append({
                            "username": author_doc.get('username'),
                            "avatar": author_doc.get('avatar_url')
                        })
                
                blog_data = {
                    "id": str(doc['_id']),
                    "title": doc.get('title', ''),
                    "content": doc.get('content', ''),
                    "authors": authors,
                    "thumbnail_url": doc.get('thumbnail_url'),
                    "tags": doc.get('tags', []),
                    "created_at": created_at_dhaka.isoformat() if created_at else None,
                    "updated_at": updated_at_dhaka.isoformat() if updated_at else None,
                    "timezone": "Asia/Dhaka (UTC+6)"
                }
                blogs_list.append(blog_data)
            
            return Response({
                "success": True,
                "count": len(blogs_list),
                "results": blogs_list
            })
            
        except Exception as e:
            return Response({
                "success": False,
                "error": f"Failed to fetch job blogs: {str(e)}"
            }, status=500)


class IsolatedListBlogs(APIView):
    """
    List blogs using direct MongoDB queries to avoid MongoEngine field conflicts
    """
    def get(self, request):
        try:
            from mongoengine.connection import get_db
            import pytz
            
            db = get_db()
            dhaka_tz = pytz.timezone('Asia/Dhaka')
            
            # Get query parameters
            status_filter = request.GET.get('status', None)
            author_filter = request.GET.get('author', None)
            category_filter = request.GET.get('category', None)
            
            # Build MongoDB query
            query = {"is_deleted": False}
            
            if status_filter == 'draft':
                query.update({
                    "is_draft": True,
                    "is_published": False
                })
            elif status_filter == 'published':
                query.update({
                    "is_published": True
                })
            elif status_filter == 'trash':
                query = {"is_deleted": True}
            
            if author_filter:
                # Find author by username
                author_doc = db.user.find_one({"username": author_filter})
                if not author_doc:
                    return Response({"error": "Author not found"}, status=404)
                query["authors"] = {"$in": [author_doc["_id"]]}
            
            if category_filter:
                query["categories"] = {"$in": [category_filter]}
            
            # Execute query
            blogs = list(db.blog.find(query).sort("created_at", -1))
            
            blogs_list = []
            for doc in blogs:
                created_at = doc.get('created_at')
                updated_at = doc.get('updated_at')
                published_at = doc.get('published_at')
                
                # Convert timestamps
                created_at_dhaka = created_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz) if created_at else None
                updated_at_dhaka = updated_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz) if updated_at else None
                published_at_dhaka = published_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz) if published_at else None
                
                # Get author details
                authors = []
                for author_id in doc.get('authors', []):
                    author_doc = db.user.find_one({"_id": author_id})
                    if author_doc:
                        authors.append({
                            "username": author_doc.get('username'),
                            "avatar": author_doc.get('avatar_url')
                        })
                
                # Determine status
                if doc.get('is_deleted'):
                    status = "deleted"
                elif doc.get('is_published'):
                    status = "published"
                else:
                    status = "draft"
                
                blog_data = {
                    "id": str(doc['_id']),
                    "title": doc.get('title', ''),
                    "content": doc.get('content', ''),
                    "authors": authors,
                    "thumbnail_url": doc.get('thumbnail_url'),
                    "categories": doc.get('categories', []),
                    "tags": doc.get('tags', []),
                    "created_at": created_at_dhaka.isoformat() if created_at_dhaka else None,
                    "updated_at": updated_at_dhaka.isoformat() if updated_at_dhaka else None,
                    "status": status,
                    "stats": {
                        "upvotes": len(doc.get('upvotes', [])),
                        "downvotes": len(doc.get('downvotes', []))
                    },
                    "version": doc.get('current_version', 1),
                    "published_at": published_at_dhaka.isoformat() if published_at_dhaka else None,
                    "timezone": "Asia/Dhaka (UTC+6)"
                }
                blogs_list.append(blog_data)
            
            return Response({
                "success": True,
                "count": len(blogs_list),
                "results": blogs_list
            })
            
        except Exception as e:
            return Response({
                "success": False,
                "error": f"Failed to fetch blogs: {str(e)}"
            }, status=500)


class IsolatedBlogSearch(APIView):
    """
    Search blogs using direct MongoDB queries to avoid MongoEngine field conflicts
    """
    def get(self, request):
        try:
            from mongoengine.connection import get_db
            import re
            
            db = get_db()
            
            query_text = request.GET.get('q', '').strip()
            status_filter = request.GET.get('status', None)
            
            if not query_text:
                return Response({"error": "Search query 'q' parameter required"}, status=400)
            
            # Build search query with regex for case-insensitive search
            regex_pattern = re.compile(query_text, re.IGNORECASE)
            
            search_conditions = {
                "$or": [
                    {"title": {"$regex": regex_pattern}},
                    {"content": {"$regex": regex_pattern}},
                    {"tags": {"$regex": regex_pattern}},
                    {"categories": {"$regex": regex_pattern}}
                ],
                "is_deleted": False
            }
            
            if status_filter == 'published':
                search_conditions.update({
                    "is_published": True,
                    "is_draft": False
                })
            elif status_filter == 'draft':
                search_conditions.update({
                    "is_draft": True,
                    "is_published": False
                })
            
            # Execute search
            blogs = list(db.blog.find(search_conditions).sort("created_at", -1))
            
            results = []
            for doc in blogs:
                # Get author usernames
                authors = []
                for author_id in doc.get('authors', []):
                    author_doc = db.user.find_one({"_id": author_id})
                    if author_doc:
                        authors.append(author_doc.get('username'))
                
                # Create excerpt
                content = doc.get('content', '')
                excerpt = content[:100] + "..." if len(content) > 100 else content
                
                # Determine status
                status = "published" if doc.get('is_published') else "draft"
                
                result = {
                    "id": str(doc['_id']),
                    "title": doc.get('title', ''),
                    "authors": authors,
                    "excerpt": excerpt,
                    "categories": doc.get('categories', []),
                    "tags": doc.get('tags', []),
                    "thumbnail_url": doc.get('thumbnail_url'),
                    "status": status,
                    "created_at": doc.get('created_at').isoformat() if doc.get('created_at') else None
                }
                results.append(result)
            
            return Response({
                "success": True,
                "results": results,
                "count": len(results)
            })
            
        except Exception as e:
            return Response({
                "success": False,
                "error": f"Search failed: {str(e)}"
            }, status=500)


class IsolatedPublishedBlogsLegacy(APIView):
    """
    Legacy PublishedBlogs endpoint using direct MongoDB queries
    """
    def get(self, request):
        try:
            from mongoengine.connection import get_db
            import pytz
            
            db = get_db()
            dhaka_tz = pytz.timezone('Asia/Dhaka')
            
            # Get parameters
            category_filter = request.GET.get('category', None)
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 10))
            
            # Build query
            query = {
                "is_published": True,
                "is_deleted": False
            }
            
            if category_filter:
                query["categories"] = {"$in": [category_filter]}
            
            # Get total count
            total = db.blog.count_documents(query)
            
            # Apply pagination
            offset = (page - 1) * limit
            blogs = list(db.blog.find(query)
                        .sort("published_at", -1)
                        .skip(offset)
                        .limit(limit))
            
            blogs_list = []
            for doc in blogs:
                published_at = doc.get('published_at')
                published_at_dhaka = published_at.replace(tzinfo=pytz.utc).astimezone(dhaka_tz) if published_at else None
                
                # Get author details
                authors = []
                for author_id in doc.get('authors', []):
                    author_doc = db.user.find_one({"_id": author_id})
                    if author_doc:
                        authors.append({
                            "username": author_doc.get('username'),
                            "avatar": author_doc.get('avatar_url')
                        })
                
                # Create excerpt
                content = doc.get('content', '')
                excerpt = content[:200] + "..." if len(content) > 200 else content
                
                blog_data = {
                    "id": str(doc['_id']),
                    "title": doc.get('title', ''),
                    "content": content,
                    "excerpt": excerpt,
                    "authors": authors,
                    "thumbnail_url": doc.get('thumbnail_url'),
                    "categories": doc.get('categories', []),
                    "tags": doc.get('tags', []),
                    "published_at": published_at_dhaka.isoformat() if published_at_dhaka else None,
                    "stats": {
                        "upvotes": len(doc.get('upvotes', [])),
                        "downvotes": len(doc.get('downvotes', []))
                    }
                }
                blogs_list.append(blog_data)
            
            return Response({
                "success": True,
                "blogs": blogs_list,
                "total": total,
                "page": page,
                "has_more": (offset + limit) < total
            })
            
        except Exception as e:
            return Response({
                "success": False,
                "error": f"Failed to fetch published blogs: {str(e)}"
            }, status=500)
