from django.http import JsonResponse
from blogs.models import Blog
import requests

def check_plagiarism(request, blog_id):
    try:
        # Get the blog by ID
        blog = Blog.objects.get(id=blog_id)
        
        # Prepare the text to check
        user_text = blog.content
        
        # API configuration
        api_url = "https://api.gowinston.ai/v2/plagiarism"
        headers = {
            "Authorization": "Bearer pFhOrzHXFLSzXCIlUqPIoS9GWfLU89HVnekiqyBJ271782d1",  # Replace with your token
            "Content-Type": "application/json",
        }
        payload = {
            "text": user_text,
            "language": "en",
            "country": "us"
        }

        # Make the API request
        resp = requests.post(api_url, json=payload, headers=headers)
        
        if resp.status_code == 200:
            data = resp.json()
            return JsonResponse({
                "success": True,
                "blog_id": str(blog.id),
                "blog_title": blog.title,
                "plagiarism_score": data.get("result", {}).get("score", 0),
                "sources": data.get("sources", [])
            })
        else:
            return JsonResponse({
                "success": False,
                "error": f"API request failed with status {resp.status_code}",
                "details": resp.text
            }, status=400)
            
    except Blog.DoesNotExist:
        return JsonResponse({
            "success": False,
            "error": "Blog not found"
        }, status=404)
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

