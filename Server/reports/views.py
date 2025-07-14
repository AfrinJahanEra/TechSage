from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from .models import BlogReport
from users.models import User
from blogs.models import Blog
import datetime

@method_decorator(csrf_exempt, name='dispatch')
class ReportBlog(View):
    def post(self, request):
        data = json.loads(request.body)
        blog = Blog.objects(id=data['blog_id']).first()
        user = User.objects(id=data['user_id']).first()
        reason = data.get('reason')
        details = data.get('details')

        if not all([blog, user, reason, details]):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        report = BlogReport(
            blog=blog,
            reported_by=user,
            reason=reason,
            details=details
        )
        report.save()
        return JsonResponse(report.to_json(), status=201)

class GetReports(View):
    def get(self, request):
        status = request.GET.get('status', 'pending')
        
        if status == 'pending':
            reports = BlogReport.objects(is_approved=False, action_taken__exists=False)
        elif status == 'approved':
            reports = BlogReport.objects(action_taken='approved')
        elif status == 'rejected':
            reports = BlogReport.objects(action_taken='rejected')
        else:
            reports = BlogReport.objects()
            
        return JsonResponse([r.to_json() for r in reports], safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class ApproveReport(View):
    def post(self, request, report_id):
        data = json.loads(request.body)
        reviewer = User.objects(id=data.get('reviewer_id')).first()

        if not reviewer or not reviewer.is_moderator:
            return JsonResponse({"error": "Unauthorized"}, status=403)

        report = BlogReport.objects(id=report_id).first()
        if not report:
            return JsonResponse({"error": "Report not found"}, status=404)

        report.is_approved = True
        report.action_taken = 'approved'
        report.reviewed_by = reviewer
        report.reviewed_at = datetime.datetime.utcnow()
        report.save()
        
        # Additional actions can be added here (e.g., notify reporter)
        
        return JsonResponse(report.to_json())

@method_decorator(csrf_exempt, name='dispatch')
class RejectReport(View):
    def post(self, request, report_id):
        data = json.loads(request.body)
        reviewer = User.objects(id=data.get('reviewer_id')).first()

        if not reviewer or not reviewer.is_moderator:
            return JsonResponse({"error": "Unauthorized"}, status=403)

        report = BlogReport.objects(id=report_id).first()
        if not report:
            return JsonResponse({"error": "Report not found"}, status=404)

        # Record rejection before deletion
        report.action_taken = 'rejected'
        report.reviewed_by = reviewer
        report.reviewed_at = datetime.datetime.utcnow()
        report.save()
        
        response_data = report.to_json()
        report.delete()
        
        return JsonResponse({
            **response_data,
            "message": "Report rejected and deleted"
        })