"""
Tenant views for multi-tenant management.
"""

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tenant_list(request):
    """List all tenants the user has access to."""
    # This would query TenantUser relationships
    return Response({
        'tenants': [],
        'message': 'Tenant functionality coming soon'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_tenant(request):
    """Create a new tenant."""
    return Response({
        'message': 'Tenant creation coming soon'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)
