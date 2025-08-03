from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from blogs.models import Blog
from comments.models import Comment
from reports.models import BlogReport
from users.models import User

@receiver(post_save, sender=Blog)
@receiver(post_delete, sender=Blog)
def update_blog_points(sender, instance, **kwargs):
    for author in instance.authors:
        author.update_points()

@receiver(post_save, sender=Comment)
@receiver(post_delete, sender=Comment)
def update_comment_points(sender, instance, **kwargs):
    instance.author.update_points()

@receiver(post_save, sender=BlogReport)
@receiver(post_delete, sender=BlogReport)
def update_report_points(sender, instance, **kwargs):
    for author in instance.blog.authors:
        author.update_points()