"""
Base models for the AdGenius platform.
These models provide common functionality across all apps.
"""

from django.db import models
import uuid
from datetime import datetime


class TimestampedModel(models.Model):
    """
    Abstract base model that provides self-updating created_at and updated_at fields.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class UUIDModel(models.Model):
    """
    Abstract base model that uses UUID as primary key.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    class Meta:
        abstract = True


class BaseModel(UUIDModel, TimestampedModel):
    """
    Abstract base model that combines UUID primary key with timestamps.
    Most models in the platform should inherit from this.
    """
    class Meta:
        abstract = True


class SoftDeleteManager(models.Manager):
    """
    Manager that excludes soft-deleted objects by default.
    """
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)


class SoftDeleteModel(BaseModel):
    """
    Abstract model that provides soft delete functionality.
    """
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    objects = SoftDeleteManager()
    all_objects = models.Manager()  # Include soft-deleted objects
    
    class Meta:
        abstract = True
    
    def delete(self, using=None, keep_parents=False):
        """
        Soft delete the object by setting deleted_at timestamp.
        """
        self.deleted_at = datetime.now()
        self.save(using=using)
    
    def hard_delete(self, using=None, keep_parents=False):
        """
        Permanently delete the object from database.
        """
        super().delete(using=using, keep_parents=keep_parents)
    
    def restore(self):
        """
        Restore a soft-deleted object.
        """
        self.deleted_at = None
        self.save()
    
    @property
    def is_deleted(self):
        """
        Check if the object is soft-deleted.
        """
        return self.deleted_at is not None
