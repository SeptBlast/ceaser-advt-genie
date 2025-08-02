"""
AdGenius Ad Generation Models using MongoEngine for MongoDB.
Handles campaigns, creatives, templates, and generation workflows.
"""

from datetime import datetime
from mongoengine import (
    Document, EmbeddedDocument, StringField, IntField, FloatField, 
    BooleanField, DateTimeField, ListField, DictField, ReferenceField,
    EmbeddedDocumentField, PULL, CASCADE
)
from enum import Enum


class CreativeType(str, Enum):
    """Creative content types."""
    IMAGE = "image"
    VIDEO = "video"
    TEXT = "text"
    CAROUSEL = "carousel"
    STORY = "story"


class GenerationStatus(str, Enum):
    """Generation job status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Platform(str, Enum):
    """Advertising platforms."""
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    GOOGLE_ADS = "google_ads"
    YOUTUBE = "youtube"
    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    TIKTOK = "tiktok"


class CreativeTemplate(Document):
    """MongoDB template for creative generation."""
    
    # Core fields
    name = StringField(required=True, max_length=200)
    description = StringField(max_length=1000)
    tenant_id = StringField(required=True, max_length=100)  # Multi-tenant support
    
    # Template configuration
    creative_type = StringField(required=True, choices=[ct.value for ct in CreativeType])
    platform = StringField(required=True, choices=[p.value for p in Platform])
    dimensions = DictField()  # e.g., {"width": 1080, "height": 1920}
    
    # AI generation parameters
    prompt_template = StringField(required=True)
    style_parameters = DictField()  # Style, mood, colors, etc.
    generation_config = DictField()  # AI model specific config
    
    # Metadata
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    created_by = StringField(max_length=100)
    
    meta = {
        'collection': 'creative_templates',
        'indexes': [
            'tenant_id',
            'creative_type',
            'platform',
            ('tenant_id', 'is_active'),
            'created_at'
        ]
    }
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp."""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} ({self.creative_type} - {self.platform})"


class Campaign(Document):
    """MongoDB campaign model."""
    
    # Core fields
    name = StringField(required=True, max_length=200)
    description = StringField(max_length=1000)
    tenant_id = StringField(required=True, max_length=100)
    
    # Campaign configuration
    target_platforms = ListField(StringField(choices=[p.value for p in Platform]))
    budget = FloatField(min_value=0)
    target_audience = DictField()  # Demographics, interests, etc.
    campaign_objectives = ListField(StringField())
    
    # Brand guidelines
    brand_guidelines = DictField()  # Colors, fonts, voice, etc.
    brand_assets = ListField(StringField())  # Asset URLs or IDs
    
    # Status and metadata
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    created_by = StringField(max_length=100)
    
    meta = {
        'collection': 'campaigns',
        'indexes': [
            'tenant_id',
            'name',
            ('tenant_id', 'is_active'),
            'created_at'
        ]
    }
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp."""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class CreativeVariation(EmbeddedDocument):
    """Embedded document for creative variations."""
    
    variation_name = StringField(max_length=100)
    content_url = StringField()  # Generated content URL
    generation_parameters = DictField()  # Parameters used for this variation
    performance_score = FloatField(min_value=0, max_value=100)
    is_approved = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)


class Creative(Document):
    """MongoDB creative model."""
    
    # Core fields
    name = StringField(required=True, max_length=200)
    description = StringField(max_length=1000)
    tenant_id = StringField(required=True, max_length=100)
    
    # Relationships
    campaign = ReferenceField(Campaign, reverse_delete_rule=CASCADE)
    template = ReferenceField(CreativeTemplate)
    
    # Creative configuration
    creative_type = StringField(required=True, choices=[ct.value for ct in CreativeType])
    target_platform = StringField(required=True, choices=[p.value for p in Platform])
    content_brief = StringField(required=True)  # Brief for AI generation
    
    # Generated variations
    variations = ListField(EmbeddedDocumentField(CreativeVariation))
    selected_variation = StringField()  # Name of selected variation
    
    # Performance data
    performance_metrics = DictField()  # CTR, conversions, etc.
    
    # Status and metadata
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    created_by = StringField(max_length=100)
    
    meta = {
        'collection': 'creatives',
        'indexes': [
            'tenant_id',
            'campaign',
            'creative_type',
            'target_platform',
            ('tenant_id', 'is_active'),
            'created_at'
        ]
    }
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp."""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} ({self.creative_type})"


class GenerationJob(Document):
    """MongoDB generation job model for tracking AI generation tasks."""
    
    # Core fields
    tenant_id = StringField(required=True, max_length=100)
    job_id = StringField(required=True, unique=True, max_length=100)
    
    # Relationships
    creative = ReferenceField(Creative, reverse_delete_rule=CASCADE)
    template = ReferenceField(CreativeTemplate)
    
    # Job configuration
    generation_type = StringField(required=True, choices=[ct.value for ct in CreativeType])
    input_parameters = DictField(required=True)  # Parameters for generation
    ai_service = StringField(required=True)  # Which AI service to use
    
    # Job status
    status = StringField(required=True, choices=[gs.value for gs in GenerationStatus], default=GenerationStatus.PENDING.value)
    progress_percentage = IntField(min_value=0, max_value=100, default=0)
    error_message = StringField()
    
    # Results
    generated_content = DictField()  # URLs, metadata of generated content
    generation_metadata = DictField()  # Model used, parameters, etc.
    
    # Timing
    started_at = DateTimeField()
    completed_at = DateTimeField()
    estimated_completion = DateTimeField()
    
    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    created_by = StringField(max_length=100)
    
    meta = {
        'collection': 'generation_jobs',
        'indexes': [
            'tenant_id',
            'job_id',
            'status',
            'creative',
            ('tenant_id', 'status'),
            'created_at'
        ]
    }
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp."""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def start_job(self):
        """Mark job as started."""
        self.status = GenerationStatus.PROCESSING.value
        self.started_at = datetime.utcnow()
        self.save()
    
    def complete_job(self, content_data, metadata=None):
        """Mark job as completed with results."""
        self.status = GenerationStatus.COMPLETED.value
        self.progress_percentage = 100
        self.completed_at = datetime.utcnow()
        self.generated_content = content_data
        if metadata:
            self.generation_metadata = metadata
        self.save()
    
    def fail_job(self, error_message):
        """Mark job as failed with error."""
        self.status = GenerationStatus.FAILED.value
        self.error_message = error_message
        self.completed_at = datetime.utcnow()
        self.save()
    
    def __str__(self):
        return f"Job {self.job_id} - {self.status}"


class CreativeMetrics(Document):
    """MongoDB metrics model for creative performance tracking."""
    
    # Core fields
    tenant_id = StringField(required=True, max_length=100)
    creative = ReferenceField(Creative, reverse_delete_rule=CASCADE)
    platform = StringField(required=True, choices=[p.value for p in Platform])
    
    # Time period
    date = DateTimeField(required=True)
    period_type = StringField(choices=['daily', 'weekly', 'monthly'], default='daily')
    
    # Performance metrics
    impressions = IntField(min_value=0, default=0)
    clicks = IntField(min_value=0, default=0)
    conversions = IntField(min_value=0, default=0)
    spend = FloatField(min_value=0, default=0.0)
    ctr = FloatField(min_value=0, default=0.0)  # Click-through rate
    cpc = FloatField(min_value=0, default=0.0)  # Cost per click
    cpa = FloatField(min_value=0, default=0.0)  # Cost per acquisition
    roas = FloatField(min_value=0, default=0.0)  # Return on ad spend
    
    # Additional metrics
    custom_metrics = DictField()  # Platform-specific metrics
    
    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'creative_metrics',
        'indexes': [
            'tenant_id',
            'creative',
            'platform',
            'date',
            ('tenant_id', 'date'),
            ('creative', 'date'),
            'created_at'
        ]
    }
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp."""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.creative.name} - {self.platform} - {self.date}"


# Utility functions for multi-tenant operations
def get_tenant_documents(model_class, tenant_id):
    """Get all documents for a specific tenant."""
    return model_class.objects(tenant_id=tenant_id)


def delete_tenant_data(tenant_id):
    """Delete all data for a specific tenant (be careful!)."""
    models = [Campaign, Creative, CreativeTemplate, GenerationJob, CreativeMetrics]
    
    for model in models:
        model.objects(tenant_id=tenant_id).delete()
