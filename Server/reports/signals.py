from django.db.models.signals import pre_delete
from django.dispatch import receiver
from blogs.models import Blog
from reports.models import BlogReport

@receiver(pre_delete, sender=Blog)
def delete_related_reports(sender, instance, **kwargs):
    BlogReport.objects(blog=instance).delete()