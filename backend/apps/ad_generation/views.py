"""
Views for the Ad Generation API using MongoDB.

These views handle HTTP requests for campaign management,
creative generation, and performance analytics.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timedelta
import logging
import uuid

from apps.ad_generation.models import (
    Campaign, Creative, CreativeVariation, GenerationJob,
    CreativeTemplate, CreativeMetrics, get_tenant_documents
)
from apps.ad_generation.serializers import (
    CampaignSerializer, CreativeSerializer, 
    GenerationJobSerializer, CreativeTemplateSerializer, CreativeMetricsSerializer
)
# from apps.ad_generation.services import AdGenerationService
# from apps.core.permissions import TenantBasedPermission

logger = logging.getLogger(__name__)


class CampaignListCreateView(APIView):
    """List all campaigns or create a new campaign."""
    
    # permission_classes = [IsAuthenticated]  # Commented out for testing
    
    def get(self, request):
        """List campaigns for the current tenant."""
        tenant_id = getattr(request, 'tenant_id', 'default')  # Get tenant from middleware
        campaigns = Campaign.objects(tenant_id=tenant_id, is_active=True)
        serializer = CampaignSerializer(campaigns, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create a new campaign."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        data = request.data.copy()
        data['tenant_id'] = tenant_id
        data['created_by'] = str(request.user.id) if request.user.is_authenticated else 'anonymous'
        
        serializer = CampaignSerializer(data=data)
        if serializer.is_valid():
            campaign = serializer.save()
            return Response(serializer.to_representation(campaign), status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CampaignDetailView(APIView):
    """Retrieve, update or delete a campaign."""
    
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, tenant_id):
        """Get campaign by ID and tenant."""
        try:
            return Campaign.objects.get(id=ObjectId(pk), tenant_id=tenant_id)
        except (Campaign.DoesNotExist, InvalidId):
            return None
    
    def get(self, request, pk):
        """Retrieve a specific campaign."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        campaign = self.get_object(pk, tenant_id)
        if not campaign:
            return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CampaignSerializer(campaign)
        return Response(serializer.to_representation(campaign))
    
    def put(self, request, pk):
        """Update a campaign."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        campaign = self.get_object(pk, tenant_id)
        if not campaign:
            return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CampaignSerializer(campaign, data=request.data, partial=True)
        if serializer.is_valid():
            updated_campaign = serializer.save()
            return Response(serializer.to_representation(updated_campaign))
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete a campaign (soft delete)."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        campaign = self.get_object(pk, tenant_id)
        if not campaign:
            return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)
        
        campaign.is_active = False
        campaign.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CreativeListCreateView(APIView):
    """List all creatives or create a new creative."""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """List creatives for the current tenant."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        
        # Filter by campaign if provided
        campaign_id = request.query_params.get('campaign_id')
        if campaign_id:
            try:
                campaign = Campaign.objects.get(id=ObjectId(campaign_id), tenant_id=tenant_id)
                creatives = Creative.objects(campaign=campaign, is_active=True)
            except (Campaign.DoesNotExist, InvalidId):
                return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            creatives = Creative.objects(tenant_id=tenant_id, is_active=True)
        
        serializer = CreativeSerializer(creatives, many=True)
        return Response([serializer.to_representation(creative) for creative in creatives])
    
    def post(self, request):
        """Create a new creative."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        data = request.data.copy()
        data['tenant_id'] = tenant_id
        data['created_by'] = str(request.user.id) if request.user.is_authenticated else 'anonymous'
        
        serializer = CreativeSerializer(data=data)
        if serializer.is_valid():
            creative = serializer.save()
            return Response(serializer.to_representation(creative), status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreativeDetailView(APIView):
    """Retrieve, update or delete a creative."""
    
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, tenant_id):
        """Get creative by ID and tenant."""
        try:
            return Creative.objects.get(id=ObjectId(pk), tenant_id=tenant_id)
        except (Creative.DoesNotExist, InvalidId):
            return None
    
    def get(self, request, pk):
        """Retrieve a specific creative."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        creative = self.get_object(pk, tenant_id)
        if not creative:
            return Response({'error': 'Creative not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CreativeSerializer(creative)
        return Response(serializer.to_representation(creative))
    
    def put(self, request, pk):
        """Update a creative."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        creative = self.get_object(pk, tenant_id)
        if not creative:
            return Response({'error': 'Creative not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CreativeSerializer(creative, data=request.data, partial=True)
        if serializer.is_valid():
            updated_creative = serializer.save()
            return Response(serializer.to_representation(updated_creative))
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete a creative (soft delete)."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        creative = self.get_object(pk, tenant_id)
        if not creative:
            return Response({'error': 'Creative not found'}, status=status.HTTP_404_NOT_FOUND)
        
        creative.is_active = False
        creative.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CreativeTemplateListCreateView(APIView):
    """List all creative templates or create a new template."""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """List templates for the current tenant."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        templates = CreativeTemplate.objects(tenant_id=tenant_id, is_active=True)
        serializer = CreativeTemplateSerializer(templates, many=True)
        return Response([serializer.to_representation(template) for template in templates])
    
    def post(self, request):
        """Create a new template."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        data = request.data.copy()
        data['tenant_id'] = tenant_id
        data['created_by'] = str(request.user.id) if request.user.is_authenticated else 'anonymous'
        
        serializer = CreativeTemplateSerializer(data=data)
        if serializer.is_valid():
            template = serializer.save()
            return Response(serializer.to_representation(template), status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreativeTemplateDetailView(APIView):
    """Retrieve, update or delete a creative template."""
    
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, tenant_id):
        """Get template by ID and tenant."""
        try:
            return CreativeTemplate.objects.get(id=ObjectId(pk), tenant_id=tenant_id)
        except (CreativeTemplate.DoesNotExist, InvalidId):
            return None
    
    def get(self, request, pk):
        """Retrieve a specific template."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        template = self.get_object(pk, tenant_id)
        if not template:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CreativeTemplateSerializer(template)
        return Response(serializer.to_representation(template))
    
    def put(self, request, pk):
        """Update a template."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        template = self.get_object(pk, tenant_id)
        if not template:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CreativeTemplateSerializer(template, data=request.data, partial=True)
        if serializer.is_valid():
            updated_template = serializer.save()
            return Response(serializer.to_representation(updated_template))
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete a template (soft delete)."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        template = self.get_object(pk, tenant_id)
        if not template:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)
        
        template.is_active = False
        template.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GenerationJobListCreateView(APIView):
    """List all generation jobs or create a new job."""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """List generation jobs for the current tenant."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        jobs = GenerationJob.objects(tenant_id=tenant_id).order_by('-created_at')
        serializer = GenerationJobSerializer(jobs, many=True)
        return Response([serializer.to_representation(job) for job in jobs])
    
    def post(self, request):
        """Create a new generation job."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        data = request.data.copy()
        data['tenant_id'] = tenant_id
        data['job_id'] = str(uuid.uuid4())
        data['created_by'] = str(request.user.id) if request.user.is_authenticated else 'anonymous'
        
        serializer = GenerationJobSerializer(data=data)
        if serializer.is_valid():
            job = serializer.save()
            
            # TODO: Trigger AI generation service
            # service = AdGenerationService()
            # service.start_generation(job)
            
            return Response(serializer.to_representation(job), status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GenerationJobDetailView(APIView):
    """Retrieve, update or delete a generation job."""
    
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, tenant_id):
        """Get job by ID and tenant."""
        try:
            return GenerationJob.objects.get(id=ObjectId(pk), tenant_id=tenant_id)
        except (GenerationJob.DoesNotExist, InvalidId):
            return None
    
    def get(self, request, pk):
        """Retrieve a specific generation job."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        job = self.get_object(pk, tenant_id)
        if not job:
            return Response({'error': 'Generation job not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = GenerationJobSerializer(job)
        return Response(serializer.to_representation(job))
    
    def put(self, request, pk):
        """Update a generation job."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        job = self.get_object(pk, tenant_id)
        if not job:
            return Response({'error': 'Generation job not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = GenerationJobSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            updated_job = serializer.save()
            return Response(serializer.to_representation(updated_job))
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreativeMetricsView(APIView):
    """Handle creative performance metrics."""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, creative_id):
        """Get metrics for a specific creative."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        
        try:
            creative = Creative.objects.get(id=ObjectId(creative_id), tenant_id=tenant_id)
        except (Creative.DoesNotExist, InvalidId):
            return Response({'error': 'Creative not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Filter by date range if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        metrics_query = CreativeMetrics.objects(creative=creative)
        if start_date and end_date:
            try:
                start = datetime.fromisoformat(start_date)
                end = datetime.fromisoformat(end_date)
                metrics_query = metrics_query.filter(date__gte=start, date__lte=end)
            except ValueError:
                return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
        
        metrics = metrics_query.order_by('-date')
        serializer = CreativeMetricsSerializer(metrics, many=True)
        return Response([serializer.to_representation(metric) for metric in metrics])
    
    def post(self, request, creative_id):
        """Create new metrics for a creative."""
        tenant_id = getattr(request, 'tenant_id', 'default')
        
        try:
            creative = Creative.objects.get(id=ObjectId(creative_id), tenant_id=tenant_id)
        except (Creative.DoesNotExist, InvalidId):
            return Response({'error': 'Creative not found'}, status=status.HTTP_404_NOT_FOUND)
        
        data = request.data.copy()
        data['tenant_id'] = tenant_id
        data['creative_id'] = creative_id
        
        serializer = CreativeMetricsSerializer(data=data)
        if serializer.is_valid():
            metrics = serializer.save()
            return Response(serializer.to_representation(metrics), status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_dashboard(request):
    """Get analytics dashboard data."""
    tenant_id = getattr(request, 'tenant_id', 'default')
    
    # Get date range (default to last 30 days)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    # Get campaigns
    campaigns = Campaign.objects(tenant_id=tenant_id, is_active=True)
    
    # Get creatives
    creatives = Creative.objects(tenant_id=tenant_id, is_active=True)
    
    # Get recent generation jobs
    recent_jobs = GenerationJob.objects(tenant_id=tenant_id).order_by('-created_at')[:10]
    
    # Aggregate metrics
    total_impressions = 0
    total_clicks = 0
    total_conversions = 0
    total_spend = 0.0
    
    for creative in creatives:
        metrics = CreativeMetrics.objects(
            creative=creative,
            date__gte=start_date,
            date__lte=end_date
        )
        for metric in metrics:
            total_impressions += metric.impressions
            total_clicks += metric.clicks
            total_conversions += metric.conversions
            total_spend += metric.spend
    
    # Calculate derived metrics
    ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
    conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
    
    return Response({
        'summary': {
            'campaigns_count': campaigns.count(),
            'creatives_count': creatives.count(),
            'active_jobs': recent_jobs.count(),
            'total_impressions': total_impressions,
            'total_clicks': total_clicks,
            'total_conversions': total_conversions,
            'total_spend': total_spend,
            'ctr': round(ctr, 2),
            'conversion_rate': round(conversion_rate, 2),
        },
        'recent_jobs': [
            {
                'id': str(job.id),
                'job_id': job.job_id,
                'status': job.status,
                'generation_type': job.generation_type,
                'created_at': job.created_at,
                'progress_percentage': job.progress_percentage,
            }
            for job in recent_jobs
        ]
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_creative(request):
    """Generate a new creative using AI."""
    tenant_id = getattr(request, 'tenant_id', 'default')
    
    # Extract parameters from request
    creative_id = request.data.get('creative_id')
    template_id = request.data.get('template_id')
    generation_params = request.data.get('parameters', {})
    
    if not creative_id:
        return Response({'error': 'creative_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        creative = Creative.objects.get(id=ObjectId(creative_id), tenant_id=tenant_id)
    except (Creative.DoesNotExist, InvalidId):
        return Response({'error': 'Creative not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Create generation job
    job_data = {
        'tenant_id': tenant_id,
        'job_id': str(uuid.uuid4()),
        'creative_id': creative_id,
        'generation_type': creative.creative_type,
        'input_parameters': generation_params,
        'ai_service': 'google_ai',  # Default to Google AI
        'created_by': str(request.user.id) if request.user.is_authenticated else 'anonymous',
    }
    
    if template_id:
        job_data['template_id'] = template_id
    
    serializer = GenerationJobSerializer(data=job_data)
    if serializer.is_valid():
        job = serializer.save()
        
        # TODO: Start AI generation
        # service = AdGenerationService()
        # service.start_generation(job)
        
        return Response({
            'message': 'Generation job created successfully',
            'job': serializer.to_representation(job)
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
