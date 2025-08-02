"""
Serializers for the Ad Generation API using MongoEngine.

These serializers handle the conversion between MongoDB documents and JSON
for the REST API, implementing validation and data transformation.
"""

from rest_framework import serializers
from bson import ObjectId
from apps.ad_generation.models import (
    Campaign, Creative, CreativeVariation, GenerationJob, 
    CreativeTemplate, CreativeMetrics, CreativeType, Platform, GenerationStatus
)


class ObjectIdField(serializers.Field):
    """Custom field for MongoDB ObjectId serialization."""
    
    def to_representation(self, value):
        return str(value) if value else None
    
    def to_internal_value(self, data):
        try:
            return ObjectId(data)
        except Exception:
            raise serializers.ValidationError('Invalid ObjectId format')


class CreativeVariationSerializer(serializers.Serializer):
    """Serializer for CreativeVariation embedded document."""
    
    variation_name = serializers.CharField(max_length=100, required=False)
    content_url = serializers.URLField(required=False)
    generation_parameters = serializers.DictField(required=False)
    performance_score = serializers.FloatField(min_value=0, max_value=100, required=False)
    is_approved = serializers.BooleanField(default=False)
    created_at = serializers.DateTimeField(read_only=True)


class CreativeTemplateSerializer(serializers.Serializer):
    """Serializer for CreativeTemplate model."""
    
    id = ObjectIdField(read_only=True)
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(max_length=1000, required=False)
    tenant_id = serializers.CharField(max_length=100)
    creative_type = serializers.ChoiceField(choices=[ct.value for ct in CreativeType])
    platform = serializers.ChoiceField(choices=[p.value for p in Platform])
    dimensions = serializers.DictField(required=False)
    prompt_template = serializers.CharField()
    style_parameters = serializers.DictField(required=False)
    generation_config = serializers.DictField(required=False)
    is_active = serializers.BooleanField(default=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    created_by = serializers.CharField(max_length=100, required=False)
    
    def create(self, validated_data):
        """Create a new template."""
        return CreativeTemplate.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """Update an existing template."""
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
    
    def to_representation(self, instance):
        """Convert model instance to dictionary."""
        return {
            'id': str(instance.id),
            'name': instance.name,
            'description': instance.description,
            'tenant_id': instance.tenant_id,
            'creative_type': instance.creative_type,
            'platform': instance.platform,
            'dimensions': instance.dimensions,
            'prompt_template': instance.prompt_template,
            'style_parameters': instance.style_parameters,
            'generation_config': instance.generation_config,
            'is_active': instance.is_active,
            'created_at': instance.created_at,
            'updated_at': instance.updated_at,
            'created_by': instance.created_by,
        }


class CampaignSerializer(serializers.Serializer):
    """Serializer for Campaign model."""
    
    id = ObjectIdField(read_only=True)
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(max_length=1000, required=False)
    tenant_id = serializers.CharField(max_length=100)
    target_platforms = serializers.ListField(
        child=serializers.ChoiceField(choices=[p.value for p in Platform]),
        required=False
    )
    budget = serializers.FloatField(min_value=0, required=False)
    target_audience = serializers.DictField(required=False)
    campaign_objectives = serializers.ListField(child=serializers.CharField(), required=False)
    brand_guidelines = serializers.DictField(required=False)
    brand_assets = serializers.ListField(child=serializers.CharField(), required=False)
    is_active = serializers.BooleanField(default=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    created_by = serializers.CharField(max_length=100, required=False)
    creatives_count = serializers.SerializerMethodField()
    performance_summary = serializers.SerializerMethodField()
    
    def get_creatives_count(self, obj):
        """Get the count of creatives in this campaign."""
        return Creative.objects(campaign=obj).count()
    
    def get_performance_summary(self, obj):
        """Get summarized performance metrics for this campaign."""
        creatives = Creative.objects(campaign=obj)
        total_impressions = 0
        total_clicks = 0
        total_conversions = 0
        total_spend = 0.0
        
        for creative in creatives:
            metrics = CreativeMetrics.objects(creative=creative)
            for metric in metrics:
                total_impressions += metric.impressions
                total_clicks += metric.clicks
                total_conversions += metric.conversions
                total_spend += metric.spend
        
        average_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        
        return {
            'total_impressions': total_impressions,
            'total_clicks': total_clicks,
            'average_ctr': round(average_ctr, 2),
            'total_conversions': total_conversions,
            'total_spend': total_spend
        }
    
    def create(self, validated_data):
        """Create a new campaign."""
        return Campaign.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """Update an existing campaign."""
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
    
    def to_representation(self, instance):
        """Convert model instance to dictionary."""
        return {
            'id': str(instance.id),
            'name': instance.name,
            'description': instance.description,
            'tenant_id': instance.tenant_id,
            'target_platforms': instance.target_platforms,
            'budget': instance.budget,
            'target_audience': instance.target_audience,
            'campaign_objectives': instance.campaign_objectives,
            'brand_guidelines': instance.brand_guidelines,
            'brand_assets': instance.brand_assets,
            'is_active': instance.is_active,
            'created_at': instance.created_at,
            'updated_at': instance.updated_at,
            'created_by': instance.created_by,
            'creatives_count': self.get_creatives_count(instance),
            'performance_summary': self.get_performance_summary(instance),
        }


class CreativeSerializer(serializers.Serializer):
    """Serializer for Creative model."""
    
    id = ObjectIdField(read_only=True)
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(max_length=1000, required=False)
    tenant_id = serializers.CharField(max_length=100)
    campaign_id = ObjectIdField(write_only=True)
    template_id = ObjectIdField(write_only=True, required=False)
    campaign_name = serializers.SerializerMethodField()
    template_name = serializers.SerializerMethodField()
    creative_type = serializers.ChoiceField(choices=[ct.value for ct in CreativeType])
    target_platform = serializers.ChoiceField(choices=[p.value for p in Platform])
    content_brief = serializers.CharField()
    variations = CreativeVariationSerializer(many=True, read_only=True)
    selected_variation = serializers.CharField(required=False)
    performance_metrics = serializers.DictField(required=False)
    is_active = serializers.BooleanField(default=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    created_by = serializers.CharField(max_length=100, required=False)
    metrics_summary = serializers.SerializerMethodField()
    
    def get_campaign_name(self, obj):
        """Get campaign name."""
        return obj.campaign.name if obj.campaign else None
    
    def get_template_name(self, obj):
        """Get template name."""
        return obj.template.name if obj.template else None
    
    def get_metrics_summary(self, obj):
        """Get summarized metrics for this creative."""
        metrics = CreativeMetrics.objects(creative=obj)
        total_impressions = sum(m.impressions for m in metrics)
        total_clicks = sum(m.clicks for m in metrics)
        total_conversions = sum(m.conversions for m in metrics)
        total_spend = sum(m.spend for m in metrics)
        
        return {
            'total_impressions': total_impressions,
            'total_clicks': total_clicks,
            'total_conversions': total_conversions,
            'total_spend': total_spend,
            'ctr': (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        }
    
    def create(self, validated_data):
        """Create a new creative with proper references."""
        campaign_id = validated_data.pop('campaign_id', None)
        template_id = validated_data.pop('template_id', None)
        
        if campaign_id:
            try:
                campaign = Campaign.objects.get(id=campaign_id)
                validated_data['campaign'] = campaign
            except Campaign.DoesNotExist:
                raise serializers.ValidationError({'campaign_id': 'Campaign not found'})
        
        if template_id:
            try:
                template = CreativeTemplate.objects.get(id=template_id)
                validated_data['template'] = template
            except CreativeTemplate.DoesNotExist:
                raise serializers.ValidationError({'template_id': 'Template not found'})
        
        return Creative.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """Update an existing creative."""
        campaign_id = validated_data.pop('campaign_id', None)
        template_id = validated_data.pop('template_id', None)
        
        if campaign_id:
            try:
                campaign = Campaign.objects.get(id=campaign_id)
                validated_data['campaign'] = campaign
            except Campaign.DoesNotExist:
                raise serializers.ValidationError({'campaign_id': 'Campaign not found'})
        
        if template_id:
            try:
                template = CreativeTemplate.objects.get(id=template_id)
                validated_data['template'] = template
            except CreativeTemplate.DoesNotExist:
                raise serializers.ValidationError({'template_id': 'Template not found'})
        
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
    
    def to_representation(self, instance):
        """Convert model instance to dictionary."""
        # Handle variations
        variations_data = []
        for variation in instance.variations:
            variations_data.append({
                'variation_name': variation.variation_name,
                'content_url': variation.content_url,
                'generation_parameters': variation.generation_parameters,
                'performance_score': variation.performance_score,
                'is_approved': variation.is_approved,
                'created_at': variation.created_at,
            })
        
        return {
            'id': str(instance.id),
            'name': instance.name,
            'description': instance.description,
            'tenant_id': instance.tenant_id,
            'campaign_name': self.get_campaign_name(instance),
            'template_name': self.get_template_name(instance),
            'creative_type': instance.creative_type,
            'target_platform': instance.target_platform,
            'content_brief': instance.content_brief,
            'variations': variations_data,
            'selected_variation': instance.selected_variation,
            'performance_metrics': instance.performance_metrics,
            'is_active': instance.is_active,
            'created_at': instance.created_at,
            'updated_at': instance.updated_at,
            'created_by': instance.created_by,
            'metrics_summary': self.get_metrics_summary(instance),
        }


class GenerationJobSerializer(serializers.Serializer):
    """Serializer for GenerationJob model."""
    
    id = ObjectIdField(read_only=True)
    tenant_id = serializers.CharField(max_length=100)
    job_id = serializers.CharField(max_length=100)
    creative_id = ObjectIdField(write_only=True)
    template_id = ObjectIdField(write_only=True, required=False)
    creative_name = serializers.SerializerMethodField()
    template_name = serializers.SerializerMethodField()
    generation_type = serializers.ChoiceField(choices=[ct.value for ct in CreativeType])
    input_parameters = serializers.DictField()
    ai_service = serializers.CharField()
    status = serializers.ChoiceField(choices=[gs.value for gs in GenerationStatus], default=GenerationStatus.PENDING.value)
    progress_percentage = serializers.IntegerField(min_value=0, max_value=100, default=0)
    error_message = serializers.CharField(required=False)
    generated_content = serializers.DictField(required=False)
    generation_metadata = serializers.DictField(required=False)
    started_at = serializers.DateTimeField(required=False)
    completed_at = serializers.DateTimeField(required=False)
    estimated_completion = serializers.DateTimeField(required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    created_by = serializers.CharField(max_length=100, required=False)
    duration = serializers.SerializerMethodField()
    
    def get_creative_name(self, obj):
        """Get creative name."""
        return obj.creative.name if obj.creative else None
    
    def get_template_name(self, obj):
        """Get template name."""
        return obj.template.name if obj.template else None
    
    def get_duration(self, obj):
        """Get job duration if completed."""
        if obj.started_at and obj.completed_at:
            delta = obj.completed_at - obj.started_at
            return delta.total_seconds()
        return None
    
    def create(self, validated_data):
        """Create a new generation job with proper references."""
        creative_id = validated_data.pop('creative_id', None)
        template_id = validated_data.pop('template_id', None)
        
        if creative_id:
            try:
                creative = Creative.objects.get(id=creative_id)
                validated_data['creative'] = creative
            except Creative.DoesNotExist:
                raise serializers.ValidationError({'creative_id': 'Creative not found'})
        
        if template_id:
            try:
                template = CreativeTemplate.objects.get(id=template_id)
                validated_data['template'] = template
            except CreativeTemplate.DoesNotExist:
                raise serializers.ValidationError({'template_id': 'Template not found'})
        
        return GenerationJob.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """Update an existing generation job."""
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
    
    def to_representation(self, instance):
        """Convert model instance to dictionary."""
        return {
            'id': str(instance.id),
            'tenant_id': instance.tenant_id,
            'job_id': instance.job_id,
            'creative_name': self.get_creative_name(instance),
            'template_name': self.get_template_name(instance),
            'generation_type': instance.generation_type,
            'input_parameters': instance.input_parameters,
            'ai_service': instance.ai_service,
            'status': instance.status,
            'progress_percentage': instance.progress_percentage,
            'error_message': instance.error_message,
            'generated_content': instance.generated_content,
            'generation_metadata': instance.generation_metadata,
            'started_at': instance.started_at,
            'completed_at': instance.completed_at,
            'estimated_completion': instance.estimated_completion,
            'created_at': instance.created_at,
            'updated_at': instance.updated_at,
            'created_by': instance.created_by,
            'duration': self.get_duration(instance),
        }


class CreativeMetricsSerializer(serializers.Serializer):
    """Serializer for CreativeMetrics model."""
    
    id = ObjectIdField(read_only=True)
    tenant_id = serializers.CharField(max_length=100)
    creative_id = ObjectIdField(write_only=True)
    creative_name = serializers.SerializerMethodField()
    platform = serializers.ChoiceField(choices=[p.value for p in Platform])
    date = serializers.DateTimeField()
    period_type = serializers.ChoiceField(choices=['daily', 'weekly', 'monthly'], default='daily')
    impressions = serializers.IntegerField(min_value=0, default=0)
    clicks = serializers.IntegerField(min_value=0, default=0)
    conversions = serializers.IntegerField(min_value=0, default=0)
    spend = serializers.FloatField(min_value=0, default=0.0)
    ctr = serializers.FloatField(min_value=0, default=0.0)
    cpc = serializers.FloatField(min_value=0, default=0.0)
    cpa = serializers.FloatField(min_value=0, default=0.0)
    roas = serializers.FloatField(min_value=0, default=0.0)
    custom_metrics = serializers.DictField(required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    def get_creative_name(self, obj):
        """Get creative name."""
        return obj.creative.name if obj.creative else None
    
    def create(self, validated_data):
        """Create new metrics with proper creative reference."""
        creative_id = validated_data.pop('creative_id', None)
        
        if creative_id:
            try:
                creative = Creative.objects.get(id=creative_id)
                validated_data['creative'] = creative
            except Creative.DoesNotExist:
                raise serializers.ValidationError({'creative_id': 'Creative not found'})
        
        return CreativeMetrics.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """Update existing metrics."""
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
    
    def to_representation(self, instance):
        """Convert model instance to dictionary."""
        return {
            'id': str(instance.id),
            'tenant_id': instance.tenant_id,
            'creative_name': self.get_creative_name(instance),
            'platform': instance.platform,
            'date': instance.date,
            'period_type': instance.period_type,
            'impressions': instance.impressions,
            'clicks': instance.clicks,
            'conversions': instance.conversions,
            'spend': instance.spend,
            'ctr': instance.ctr,
            'cpc': instance.cpc,
            'cpa': instance.cpa,
            'roas': instance.roas,
            'custom_metrics': instance.custom_metrics,
            'created_at': instance.created_at,
            'updated_at': instance.updated_at,
        }
