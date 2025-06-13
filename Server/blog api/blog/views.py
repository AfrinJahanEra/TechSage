from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bson.objectid import ObjectId
from datetime import datetime
import json
from pymongo.errors import InvalidId
from django.conf import settings

if hasattr(settings, 'MONGO_DB'):
    blog_collection = settings.MONGO_DB['blogs']
else:
    raise Exception("MONGO_DB not found in settings.")


def parse_json(obj):
    obj['_id'] = str(obj['_id'])
    return obj

@csrf_exempt
def create_blog(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        blog = {
            "title": data.get("title"),
            "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "author": data.get("author"),
            "author_id": data.get("author_id"),
            "upvotes": 0,
            "downvotes": 0,
            "comments": [],
            "share_number": 0
        }
        result = blog_collection.insert_one(blog)
        return JsonResponse({"id": str(result.inserted_id)})

@csrf_exempt
def blog_list(request):
    if request.method == 'GET':
        blogs = list(blog_collection.find())
        blogs = [parse_json(blog) for blog in blogs]
        return JsonResponse(blogs, safe=False)

@csrf_exempt
def blog_detail(request, id):
    try:
        blog = blog_collection.find_one({"_id": ObjectId(id)})
        if blog:
            return JsonResponse(parse_json(blog))
        else:
            return JsonResponse({"error": "Blog not found"}, status=404)
    except Exception:
        return JsonResponse({"error": "Invalid ID"}, status=400)

@csrf_exempt
def update_blog(request, id):
    if request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            update_fields = {}

            for key in ['title', 'author', 'author_id', 'share_number']:
                if key in data:
                    update_fields[key] = data[key]

            if 'upvote' in data:
                update_fields['$inc'] = {'upvotes': 1}
            if 'downvote' in data:
                update_fields.setdefault('$inc', {})['downvotes'] = 1
            if 'comment' in data:
                update_fields.setdefault('$push', {})['comments'] = data['comment']

            result = blog_collection.update_one({'_id': ObjectId(id)}, update_fields)
            if result.modified_count:
                return JsonResponse({"message": "Blog updated"})
            return JsonResponse({"message": "No changes made"}, status=204)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def delete_blog(request, id):
    if request.method == 'DELETE':
        try:
            result = blog_collection.delete_one({'_id': ObjectId(id)})
            if result.deleted_count:
                return JsonResponse({"message": "Blog deleted"})
            else:
                return JsonResponse({"error": "Blog not found"}, status=404)
        except:
            return JsonResponse({"error": "Invalid ID"}, status=400)
