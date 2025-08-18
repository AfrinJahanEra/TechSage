from datetime import datetime
from mongoengine import Document, fields, EmbeddedDocument, ValidationError, CASCADE
from users.models import User
import cloudinary.uploader

class BlogVersion(EmbeddedDocument):
    title = fields.StringField(required=True)
    content = fields.StringField(required=True)
    thumbnail_url = fields.StringField()
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    updated_by = fields.StringField()
    is_draft = fields.BooleanField(default=True)
    categories = fields.ListField(fields.StringField())
    tags = fields.ListField(fields.StringField())

class Blog(Document):
    title = fields.StringField(required=True)
    content = fields.StringField(required=True)
    authors = fields.ListField(fields.ReferenceField(User))
    thumbnail_url = fields.StringField()
    categories = fields.ListField(fields.StringField())
    tags = fields.ListField(fields.StringField())
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    versions = fields.ListField(fields.EmbeddedDocumentField(BlogVersion))
    current_version = fields.IntField(default=1)
    is_draft = fields.BooleanField(default=True)
    is_published = fields.BooleanField(default=False)
    published_at = fields.DateTimeField()
    published_by = fields.StringField()
    is_deleted = fields.BooleanField(default=False)
    deleted_at = fields.DateTimeField()
    deleted_by = fields.StringField()
    upvotes = fields.ListField(fields.ReferenceField(User))
    downvotes = fields.ListField(fields.ReferenceField(User))
    draft_history = fields.ListField(fields.DateTimeField())
    is_reviewed = fields.BooleanField(default=False)
    reviewed_by = fields.ReferenceField(User, null=True)
    upvote_count = fields.IntField(default=0)
    downvote_count = fields.IntField(default=0)
    
    meta = {
        'collection': 'blogs',
        'ordering': ['-created_at'],
        'indexes': [
            'is_draft',
            'is_published',
            'is_deleted',
            'tags',
            'is_reviewed',
            'categories'
        ]
    }

    def clean(self):
        """Validate that blog can't be both draft and published"""
        if self.is_draft and self.is_published:
            raise ValidationError("A blog cannot be both published and a draft")
        
        if self.is_published:
            if not self.title or not self.content:
                raise ValidationError("Title and content are required for publishing")
            if not self.published_at:
                self.published_at = datetime.utcnow()

    def save_version(self, username):
        version = BlogVersion(
            title=self.title,
            content=self.content,
            thumbnail_url=self.thumbnail_url,
            updated_by=username,
            is_draft=self.is_draft,
            categories=self.categories,
            tags=self.tags
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
            self.categories = version.categories
            self.tags = version.tags
            self.is_draft = version.is_draft
            self.is_published = not self.is_draft
            self.save()
            return True
        except IndexError:
            return False
        
    def publish(self, username):
        """Publish the blog"""
        if not self.title or not self.content:
            raise ValidationError("Title and content are required for publishing")
        
        self.is_draft = False
        self.is_published = True
        self.published_at = datetime.utcnow()
        self.published_by = username
        self.save()
        
    def unpublish(self, username):
        """Convert published blog back to draft"""
        self.is_draft = True
        self.is_published = False
        self.save()
        
    def soft_delete(self, username):
        """Move blog to trash"""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
        self.deleted_by = username
        self.save()

    def hard_delete(self):
        """Permanently delete blog"""
        if self.thumbnail_url:
            public_id = self.thumbnail_url.split('/')[-1].split('.')[0]
            cloudinary.uploader.destroy(public_id)
        self.delete()

    def add_author(self, user):
        """Add an author to the blog if not already present"""
        if user not in self.authors:
            self.authors.append(user)
            self.save()
            return True
        return False
    
    def create_draft(self, username):
        """Create a minimal draft blog with just required fields"""
        self.title = "Untitled Draft"
        self.content = ""
        self.authors = [username]
        self.is_draft = True
        self.is_published = False
        self.is_deleted = False
        self.save()
        self.save_version(username)
        return self

    def update_draft(self, data, username):
        """Update draft with additional fields"""
        if 'title' in data:
            self.title = data['title']
        if 'content' in data:
            self.content = data['content']
        # Merge new categories and tags with existing ones, avoiding duplicates
        new_categories = data.getlist('categories[]', []) if hasattr(data, 'getlist') else (data.get('categories[]', []) if isinstance(data.get('categories[]'), list) else [data.get('categories[]', '')] if data.get('categories[]') else [])
        self.categories = list(set(self.categories + new_categories))
        new_tags = data.getlist('tags[]', []) if hasattr(data, 'getlist') else (data.get('tags[]', []) if isinstance(data.get('tags[]'), list) else [data.get('tags[]', '')] if data.get('tags[]') else [])
        self.tags = list(set(self.tags + new_tags))
        self.save()
        self.save_version(username)
        return self
    
class Vote(Document):
    blog = fields.ReferenceField(Blog, reverse_delete_rule=CASCADE)
    user = fields.ReferenceField(User, reverse_delete_rule=CASCADE)
    vote_type = fields.StringField(choices=['upvote', 'downvote'], required=True)
    created_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'indexes': [
            {'fields': ['blog', 'user'], 'unique': True}
        ]
    }