from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from .models import BlogReport
from users.models import User
from blogs.models import Blog
import datetime
from mongoengine.errors import DoesNotExist, ValidationError

@method_decorator(csrf_exempt, name='dispatch')
class ReportBlog(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            blog = Blog.objects.get(id=data['blog_id'])
            user = User.objects.get(id=data['user_id'])
            reason = data.get('reason')
            details = data.get('details')

            if not all([blog, user, reason, details]):
                return JsonResponse({"error": "Missing required fields"}, status=400)

            report = BlogReport(
                blog=blog,
                reported_by=user,
                reason=reason,
                details=details,
                status='pending',
                is_reviewed=False
            )
            report.save()
            return JsonResponse(report.to_json(), status=201)
        except (DoesNotExist, ValidationError) as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

class GetReports(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
        
    def get(self, request):
        try:
            # Get the status filter from query parameters
            status_filter = request.GET.get('status')
            
            # Fetch reports based on the filter
            if status_filter == 'pending':
                reports = BlogReport.objects(is_reviewed=False, status='pending')
            elif status_filter == 'accepted':
                reports = BlogReport.objects(status='accepted')
            elif status_filter == 'rejected':
                reports = BlogReport.objects(status='rejected')
            else:
                # If no status filter is provided or status is 'all', return all reports
                reports = BlogReport.objects()
            
            # Filter out reports with invalid references
            valid_reports = []
            for report in reports:
                try:
                    # Test if references exist
                    if report.blog and report.reported_by:
                        valid_reports.append(report)
                except:
                    continue
                    
            return JsonResponse([r.to_json() for r in valid_reports], safe=False)
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ApproveReport(View):
    def post(self, request, report_id):
        try:
            data = json.loads(request.body)
            reviewer = User.objects.get(id=data.get('reviewer_id'))

            if reviewer.role != 'moderator':
                return JsonResponse({"error": "Unauthorized"}, status=403)

            report = BlogReport.objects.get(id=report_id)
            
            # Update report status
            report.status = 'accepted'
            report.is_reviewed = True
            report.reviewed_by = reviewer
            report.reviewed_at = datetime.datetime.utcnow()
            report.save()
            
            # Delete the reported blog
            blog = report.blog
            blog.delete()
            
            return JsonResponse(report.to_json())
        except DoesNotExist as e:
            return JsonResponse({"error": str(e)}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class RejectReport(View):
    def post(self, request, report_id):
        try:
            data = json.loads(request.body)
            reviewer = User.objects.get(id=data.get('reviewer_id'))

            if reviewer.role != 'moderator':
                return JsonResponse({"error": "Unauthorized"}, status=403)

            report = BlogReport.objects.get(id=report_id)
            
            # Update report status first
            report.status = 'rejected'
            report.is_reviewed = True
            report.reviewed_by = reviewer
            report.reviewed_at = datetime.datetime.utcnow()
            report.save()
            
            return JsonResponse(report.to_json())
        except DoesNotExist as e:
            return JsonResponse({"error": str(e)}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)