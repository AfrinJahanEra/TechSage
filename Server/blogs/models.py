from datetime import datetime
from mongoengine import Document, fields, EmbeddedDocument
from users.models import User
import cloudinary.uploader

class BlogVersion(EmbeddedDocument):
    title = fields.StringField(required=True)
    content = fields.StringField(required=True)
    thumbnail_url = fields.StringField()
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    updated_by = fields.StringField()

class Blog(Document):
    title = fields.StringField(required=True)
    content = fields.StringField(required=True)
    author = fields.ReferenceField(User)
    thumbnail_url = fields.StringField()
    categories = fields.ListField(fields.StringField())
    tags = fields.ListField(fields.StringField())
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    versions = fields.ListField(fields.EmbeddedDocumentField(BlogVersion))
    current_version = fields.IntField(default=1)
    is_deleted = fields.BooleanField(default=False)
    deleted_at = fields.DateTimeField()
    deleted_by = fields.StringField()
    upvotes = fields.ListField(fields.ReferenceField(User))
    downvotes = fields.ListField(fields.ReferenceField(User))
    
    meta = {
        'collection': 'blogs',
        'ordering': ['-created_at']
    }

    def save_version(self, username):
        version = BlogVersion(
            title=self.title,
            content=self.content,
            thumbnail_url=self.thumbnail_url,
            updated_by=username
        )
        if not self.versions:
            self.versions = []
        self.versions.append(version)
        self.current_version = len(self.versions)

    def revert_to_version(self, version_number, username):
        try:
            version = self.versions[version_number - 1]
            self.save_version(username)
            self.title = version.title
            self.content = version.content
            self.thumbnail_url = version.thumbnail_url
            self.save()
            return True
        except IndexError:
            return False
        
    def soft_delete(self, username):
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
        self.deleted_by = username
        self.save()

    def hard_delete(self):
        if self.thumbnail_url:
            public_id = self.thumbnail_url.split('/')[-1].split('.')[0]
            cloudinary.uploader.destroy(public_id)
        self.delete()