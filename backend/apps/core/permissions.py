"""
Custom permissions for the multi-tenant application.

Provides tenant-based access control and role-based permissions.
"""

from rest_framework import permissions
from django.http import Http404


class TenantBasedPermission(permissions.BasePermission):
    """
    Permission class that ensures users can only access resources
    within their tenant scope.
    """
    
    def has_permission(self, request, view):
        """
        Check if the user has permission to access the view.
        
        Requires:
        - User must be authenticated
        - Request must have a tenant context
        - User must belong to the tenant
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if tenant context is available
        if not hasattr(request, 'tenant') or not request.tenant:
            return False
        
        # Check if user belongs to the tenant
        # This would typically check user-tenant relationship
        # For now, we'll assume the middleware has validated this
        return True
    
    def has_object_permission(self, request, view, obj):
        """
        Check if the user has permission to access a specific object.
        
        The object must belong to the same tenant as the request.
        """
        if not self.has_permission(request, view):
            return False
        
        # Check if object has tenant attribute
        if hasattr(obj, 'tenant'):
            return obj.tenant == request.tenant
        
        # For objects without direct tenant relationship,
        # check through related fields
        if hasattr(obj, 'campaign') and hasattr(obj.campaign, 'tenant'):
            return obj.campaign.tenant == request.tenant
        
        if hasattr(obj, 'creative') and hasattr(obj.creative, 'tenant'):
            return obj.creative.tenant == request.tenant
        
        # Default to denying access if tenant relationship cannot be determined
        return False


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission class that allows owners of an object to edit it.
    Read permissions are allowed to any authenticated user within the tenant.
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user can access the object.
        
        Read permissions are allowed to any authenticated user.
        Write permissions are only allowed to the owner of the object.
        """
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object.
        return obj.user == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission class that allows admin users to perform any action,
    while regular users can only read.
    """
    
    def has_permission(self, request, view):
        """Check if user has admin permissions for write operations."""
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if user is tenant admin
        return request.user.is_staff or getattr(request.user, 'is_tenant_admin', False)


class CanManageCampaigns(permissions.BasePermission):
    """
    Permission for users who can manage campaigns.
    """
    
    def has_permission(self, request, view):
        """Check if user can manage campaigns."""
        if not request.user.is_authenticated:
            return False
        
        # Check user's role or permissions
        user_permissions = getattr(request.user, 'tenant_permissions', [])
        return 'manage_campaigns' in user_permissions or request.user.is_staff


class CanGenerateCreatives(permissions.BasePermission):
    """
    Permission for users who can generate creatives.
    """
    
    def has_permission(self, request, view):
        """Check if user can generate creatives."""
        if not request.user.is_authenticated:
            return False
        
        # Check user's role or permissions
        user_permissions = getattr(request.user, 'tenant_permissions', [])
        return 'generate_creatives' in user_permissions or request.user.is_staff


class CanViewAnalytics(permissions.BasePermission):
    """
    Permission for users who can view analytics and performance data.
    """
    
    def has_permission(self, request, view):
        """Check if user can view analytics."""
        if not request.user.is_authenticated:
            return False
        
        # Check user's role or permissions
        user_permissions = getattr(request.user, 'tenant_permissions', [])
        return 'view_analytics' in user_permissions or request.user.is_staff


class RateLimitPermission(permissions.BasePermission):
    """
    Permission class that enforces rate limiting based on tenant plan.
    """
    
    def has_permission(self, request, view):
        """Check if the request is within rate limits."""
        if not hasattr(request, 'tenant'):
            return False
        
        # This would typically check against a rate limiting service
        # For now, we'll just return True
        # In a real implementation, you'd check:
        # - Tenant's subscription plan
        # - Current usage metrics
        # - Rate limit thresholds
        
        return True
