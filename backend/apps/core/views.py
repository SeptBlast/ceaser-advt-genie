"""
Core views for the application.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint."""
    return Response({
        'status': 'healthy',
        'version': '1.0.0',
        'environment': getattr(settings, 'ENVIRONMENT', 'development')
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_info(request):
    """API information endpoint."""
    return Response({
        'name': 'AdGenius API',
        'version': '1.0.0',
        'description': 'Multi-Tenant Generative AI Advertising Platform',
        'docs': '/api/schema/swagger-ui/',
        'openapi': '/api/schema/',
    }, status=status.HTTP_200_OK)
