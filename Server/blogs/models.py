from datetime import datetime
from mongoengine import Document, fields, EmbeddedDocument
from users.models import User

class BlogVersion(EmbeddedDocument):
    title = fields.StringField(required=True)
    content = fields.StringField(required=True)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    updated_by = fields.StringField()  # Store username instead of ReferenceField

class Blog(Document):
    title = fields.StringField(required=True)
    content = fields.StringField(required=True)
    author = fields.ReferenceField(User)
    created_at = fields.DateTimeField(default=datetime.utcnow)
    versions = fields.ListField(fields.EmbeddedDocumentField(BlogVersion))
    current_version = fields.IntField(default=1)
    
    meta = {
        'collection': 'blogs',
        'ordering': ['-created_at']
    }

    def save_version(self, username):
        """Save current state as a new version"""
        version = BlogVersion(
            title=self.title,
            content=self.content,
            updated_by=username
        )
        if not self.versions:
            self.versions = []
        self.versions.append(version)
        self.current_version = len(self.versions)

    def revert_to_version(self, version_number, username):
        """Revert to a specific version"""
        try:
            version = self.versions[version_number - 1]
            
            # Save current state as new version first
            self.save_version(username)
            
            # Revert content
            self.title = version.title
            self.content = version.content
            self.save()
            
            return True
        except IndexError:
            return False
