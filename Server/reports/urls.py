from django.urls import path
from .views import ReportBlog, ApproveReport, RejectReport, GetReports

urlpatterns = [
    path('submit/', ReportBlog.as_view()),
    path('', GetReports.as_view(), name='get-reports'),
    path('<str:report_id>/approve/', ApproveReport.as_view(), name='approve-report'),
    path('<str:report_id>/reject/', RejectReport.as_view(), name='reject-report'),
]
