"""
Models for the Ad Generation system.

These models implement the database schema for storing generated creatives,
campaigns, and related metadata using Django's ORM with MongoDB via Djongo.
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from djongo import models as djongo_models
from apps.tenants.models import Tenant

User = get_user_model()


class Campaign(models.Model):
    """
    Model representing an advertising campaign.
    
    A campaign is a container for multiple creatives and tracks
    performance metrics across all associated ads.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='campaigns')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns')
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Campaign configuration
    target_audience = models.TextField(blank=True)
    brand_guidelines = djongo_models.JSONField(default=dict)
    campaign_objectives = djongo_models.JSONField(default=list)
    
    # Status and metadata
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('active', 'Active'),
            ('paused', 'Paused'),
            ('completed', 'Completed'),
            ('archived', 'Archived'),
        ],
        default='draft'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    # Performance tracking
    total_budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    spent_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'campaigns'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.tenant.name})"


class Creative(models.Model):
    """
    Model representing a generated creative asset.
    
    This stores the actual creative content, metadata about its generation,
    and performance metrics.
    """
    
    # Creative types
    CREATIVE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('multimodal', 'Multi-modal'),
    ]
    
    # Creative formats
    FORMAT_CHOICES = [
        # Text formats
        ('headline', 'Headline'),
        ('slogan', 'Slogan'),
        ('body_copy', 'Body Copy'),
        ('script', 'Script'),
        
        # Image formats
        ('banner', 'Banner'),
        ('social_post', 'Social Post'),
        ('product_shot', 'Product Shot'),
        
        # Video formats
        ('short_form', 'Short Form'),
        ('commercial', 'Commercial'),
        ('social_video', 'Social Video'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='creatives')
    
    # Creative identification
    name = models.CharField(max_length=255)
    creative_type = models.CharField(max_length=20, choices=CREATIVE_TYPES)
    creative_format = models.CharField(max_length=50, choices=FORMAT_CHOICES)
    
    # Generation metadata
    original_prompt = models.TextField()
    engineered_prompt = models.TextField()
    model_used = models.CharField(max_length=100)
    generation_time = models.FloatField()  # seconds
    
    # Creative content
    content = djongo_models.JSONField()  # Flexible storage for different content types
    content_url = models.URLField(blank=True)  # For hosted assets (images, videos)
    
    # Quality and performance
    quality_score = models.FloatField(null=True, blank=True)
    performance_metrics = djongo_models.JSONField(default=dict)
    
    # Metadata and context
    generation_parameters = djongo_models.JSONField(default=dict)
    brand_compliance_score = models.FloatField(null=True, blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('generated', 'Generated'),
            ('reviewed', 'Reviewed'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('published', 'Published'),
            ('archived', 'Archived'),
        ],
        default='generated'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'creatives'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['campaign', 'creative_type']),
            models.Index(fields=['creative_type', 'creative_format']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['model_used', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.creative_type}/{self.creative_format})"


class CreativeVariation(models.Model):
    """
    Model for storing variations of a creative.
    
    This allows for A/B testing and iteration on creative concepts.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent_creative = models.ForeignKey(Creative, on_delete=models.CASCADE, related_name='variations')
    
    # Variation metadata
    variation_name = models.CharField(max_length=255)
    variation_prompt = models.TextField()
    variation_parameters = djongo_models.JSONField(default=dict)
    
    # Content
    content = djongo_models.JSONField()
    content_url = models.URLField(blank=True)
    
    # Performance comparison
    performance_metrics = djongo_models.JSONField(default=dict)
    quality_score = models.FloatField(null=True, blank=True)
    
    # A/B testing
    test_group = models.CharField(max_length=50, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'creative_variations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['parent_creative', 'test_group']),
        ]
    
    def __str__(self):
        return f"{self.variation_name} (variant of {self.parent_creative.name})"


class GenerationJob(models.Model):
    """
    Model for tracking creative generation jobs.
    
    This provides visibility into the generation process and allows
    for monitoring of long-running generation tasks.
    """
    
    JOB_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='generation_jobs')
    
    # Job configuration
    job_type = models.CharField(max_length=50)  # batch, single, variation_test, etc.
    parameters = djongo_models.JSONField(default=dict)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=JOB_STATUS_CHOICES, default='pending')
    progress = models.IntegerField(default=0)  # 0-100
    total_items = models.IntegerField(default=1)
    completed_items = models.IntegerField(default=0)
    
    # Results
    results = djongo_models.JSONField(default=dict)
    error_message = models.TextField(blank=True)
    
    # Timing
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'generation_jobs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['campaign', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Generation Job {self.id} ({self.status})"


class CreativeTemplate(models.Model):
    """
    Model for storing reusable creative templates.
    
    Templates allow users to standardize and accelerate creative generation
    by providing pre-configured prompts and parameters.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='creative_templates')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_templates')
    
    # Template identification
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    
    # Template configuration
    creative_type = models.CharField(max_length=20, choices=Creative.CREATIVE_TYPES)
    creative_format = models.CharField(max_length=50, choices=Creative.FORMAT_CHOICES)
    
    # Template content
    prompt_template = models.TextField()
    default_parameters = djongo_models.JSONField(default=dict)
    
    # Usage and sharing
    is_public = models.BooleanField(default=False)
    usage_count = models.IntegerField(default=0)
    
    # Performance tracking
    average_quality_score = models.FloatField(null=True, blank=True)
    success_rate = models.FloatField(null=True, blank=True)  # 0-1
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'creative_templates'
        ordering = ['-usage_count', '-created_at']
        indexes = [
            models.Index(fields=['tenant', 'creative_type']),
            models.Index(fields=['is_public', 'category']),
            models.Index(fields=['usage_count', 'success_rate']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.creative_type}/{self.creative_format})"


class CreativeMetrics(models.Model):
    """
    Model for detailed creative performance metrics.
    
    This stores time-series performance data for analytics and optimization.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creative = models.ForeignKey(Creative, on_delete=models.CASCADE, related_name='metrics')
    
    # Metric type and source
    metric_type = models.CharField(max_length=100)  # impressions, clicks, conversions, etc.
    metric_source = models.CharField(max_length=100)  # platform where metric was recorded
    
    # Metric values
    value = models.FloatField()
    count = models.IntegerField(default=1)
    
    # Context
    platform = models.CharField(max_length=100, blank=True)
    placement = models.CharField(max_length=100, blank=True)
    audience_segment = models.CharField(max_length=100, blank=True)
    
    # Additional data
    metadata = djongo_models.JSONField(default=dict)
    
    # Timestamp
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'creative_metrics'
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['creative', 'metric_type', 'recorded_at']),
            models.Index(fields=['metric_type', 'platform', 'recorded_at']),
        ]
    
    def __str__(self):
        return f"{self.metric_type}: {self.value} for {self.creative.name}"
