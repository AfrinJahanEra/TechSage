from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from .models import BlogReport
from users.models import User
from blogs.models import Blog

@method_decorator(csrf_exempt, name='dispatch')
class ReportBlog(View):
    def post(self, request):
        data = json.loads(request.body)
        blog = Blog.objects(id=data['blog_id']).first()
        user = User.objects(id=data['user_id']).first()
        reason = data.get('reason', '')

        if not blog or not user or not reason:
            return JsonResponse({"error": "Missing or invalid fields"}, status=400)

        report = BlogReport(blog=blog, reported_by=user, reason=reason)
        report.save()
        return JsonResponse(report.to_json(), status=201)

class PendingReports(View):
    def get(self, request):
        reports = BlogReport.objects(is_approved=False)
        return JsonResponse([r.to_json() for r in reports], safe=False)

class ApprovedReports(View):
    def get(self, request):
        reports = BlogReport.objects(is_approved=True)
        return JsonResponse([r.to_json() for r in reports], safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class ApproveReport(View):
    def post(self, request, report_id):
        data = json.loads(request.body)
        user = User.objects(id=data.get('user_id')).first()

        if not user or not user.is_reviewer:
            return JsonResponse({"error": "Only reviewers can approve reports"}, status=403)

        report = BlogReport.objects(id=report_id).first()
        if not report:
            return JsonResponse({"error": "Report not found"}, status=404)

        report.is_approved = True
        report.save()
        return JsonResponse(report.to_json())

@method_decorator(csrf_exempt, name='dispatch')
class RejectReport(View):
    def post(self, request, report_id):
        data = json.loads(request.body)
        user = User.objects(id=data.get('user_id')).first()

        if not user or not user.is_reviewer:
            return JsonResponse({"error": "Only reviewers can reject reports"}, status=403)

        report = BlogReport.objects(id=report_id).first()
        if not report:
            return JsonResponse({"error": "Report not found"}, status=404)

        report.delete()
        return JsonResponse({"success": "Report rejected and deleted"})
