"""
Custom middleware for the AdGenius platform.
"""

from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin
from django.db import connection
from apps.tenants.models import Tenant
from apps.tenants.utils import get_tenant_from_request
import logging

logger = logging.getLogger(__name__)


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to handle multi-tenant database routing.
    This middleware extracts tenant information from the request and
    sets up the appropriate database connection.
    """
    
    def process_request(self, request):
        """
        Process the incoming request to determine the tenant and set up database routing.
        """
        try:
            # Extract tenant from request (subdomain, header, etc.)
            tenant = get_tenant_from_request(request)
            
            if tenant:
                # Store tenant in request for use in views
                request.tenant = tenant
                
                # Set up tenant-specific database routing
                self._setup_tenant_database(tenant)
            else:
                # Handle requests without tenant context (e.g., admin, health checks)
                request.tenant = None
                
        except Exception as e:
            logger.error(f"Error in TenantMiddleware: {e}")
            # In case of error, allow request to continue without tenant context
            request.tenant = None
    
    def _setup_tenant_database(self, tenant):
        """
        Configure database connection for the specified tenant.
        """
        # This would be implemented based on the specific database routing strategy
        # For now, we'll store the tenant database name for later use
        tenant_db_name = f"tenant_{tenant.slug}_db"
        
        # In a real implementation, you might modify Django's database routing here
        # or store the tenant context for use in database operations
        connection.tenant_db_name = tenant_db_name


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to add security headers to responses.
    """
    
    def process_response(self, request, response):
        """
        Add security headers to the response.
        """
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Add CORS headers for API responses
        if request.path.startswith('/api/'):
            response['Access-Control-Allow-Origin'] = '*'  # Configure appropriately
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        return response
