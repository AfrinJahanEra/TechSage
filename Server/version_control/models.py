from datetime import datetime
from mongoengine import EmbeddedDocument, Document, fields
from blogs.models import Blog
from users.models import User

class BlogVersion(EmbeddedDocument):
    """Tracks changes with author reference"""
    title = fields.StringField(required=True)
    content = fields.StringField(required=True)
    thumbnail_url = fields.StringField()
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    updated_by = fields.StringField()  
    author = fields.ReferenceField(User) 
    is_draft = fields.BooleanField(default=True)
    categories = fields.ListField(fields.StringField())
    tags = fields.ListField(fields.StringField())

class VersionedBlog(Document):
    """Proxy model to add version control to existing Blog"""
    blog = fields.ReferenceField(Blog, unique=True)
    versions = fields.ListField(fields.EmbeddedDocumentField(BlogVersion))
    current_version = fields.IntField(default=1)

    meta = {
        'collection': 'versioned_blogs',
        'indexes': ['blog']
    }

    def save_version(self, user):
        """Save current state as a new version"""
        blog = self.blog
        version = BlogVersion(
            title=blog.title,
            content=blog.content,
            thumbnail_url=blog.thumbnail_url,
            updated_by=user.username,
            author=user,
            is_draft=blog.is_draft,
            categories=blog.categories,
            tags=blog.tags
        )
        if not self.versions:
            self.versions = []
        self.versions.append(version)
        self.current_version = len(self.versions)
        self.save()

    def revert_to_version(self, version_number, user):
        """Roll back to a specific version"""
        try:
            version = self.versions[version_number - 1]
            self.save_version(user)  
            

            blog = self.blog
            blog.title = version.title
            blog.content = version.content
            blog.thumbnail_url = version.thumbnail_url
            blog.categories = version.categories
            blog.tags = version.tags
            blog.save()
            
            return True
        except IndexError:
            return False