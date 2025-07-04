from django.urls import path
from .views import ReportBlog, PendingReports, ApprovedReports, ApproveReport, RejectReport

urlpatterns = [
    path('submit/', ReportBlog.as_view()),
    path('pending/', PendingReports.as_view()),
    path('approved/', ApprovedReports.as_view()),
    path('<str:report_id>/approve/', ApproveReport.as_view()),
    path('<str:report_id>/reject/', RejectReport.as_view()),
]
