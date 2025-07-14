import requests
from django.http import HttpResponse

def check_plagiarism(request):
    if request.method == "POST":
        user_text = request.POST.get("text", "")
        api_url = "https://api.gowinston.ai/v2/plagiarism"

        headers = {
            "Authorization": "Bearer YOUR_REAL_TOKEN_HERE",  # Replace with your token
            "Content-Type": "application/json",
        }

        payload = {
            "text": user_text,
            "language": "en",
            "country": "us"
        }

        try:
            resp = requests.post(api_url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                score = data.get("result", {}).get("score", "N/A")
                sources = data.get("sources", [])
                lines = [f"Plagiarism Score: {score}%\n"]
                for src in sources:
                    lines.append(
                        f"- {src.get('title')} ({src.get('url')}): {src.get('plagiarismWords')} words"
                    )
                report = "\n".join(lines)
            else:
                report = f"Error: {resp.status_code}\n{resp.text}"
        except Exception as e:
            report = f"Exception occurred: {str(e)}"

        return HttpResponse(report, content_type="text/plain")
    else:
        return HttpResponse("Only POST requests are allowed.", content_type="text/plain")
