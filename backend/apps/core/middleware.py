"""
Multi-tenant middleware for AdGenius platform.

This middleware implements the database-per-tenant routing by:
1. Extracting tenant information from the request hostname
2. Setting the appropriate database context for the request
3. Ensuring all database operations are automatically scoped to the correct tenant
"""

import logging
from django.http import HttpResponse
from django.conf import settings
from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin
from apps.core.db_router import MultiTenantDBRouter
from apps.tenants.models import Tenant
from apps.tenants.utils import get_tenant_from_request

logger = logging.getLogger(__name__)


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware that resolves tenant from request hostname and sets database context.
    
    This middleware works by:
    1. Extracting the subdomain from the request hostname
    2. Looking up the tenant in the public database
    3. Setting the tenant database context for the entire request
    4. Cleaning up the context after the request
    """
    
    def process_request(self, request):
        """Process the incoming request to determine the tenant and set up database routing."""
        try:
            # Extract tenant from request (hostname, subdomain, etc.)
            tenant = get_tenant_from_request(request)
            
            if tenant:
                # Set tenant database context using the new router
                tenant_db = f"tenant_{tenant.slug}_db"
                MultiTenantDBRouter.set_tenant_db(tenant_db)
                
                # Add tenant to request for easy access in views
                request.tenant = tenant
                request.tenant_db = tenant_db
                
                logger.debug(f"Tenant context set: {tenant.slug} -> {tenant_db}")
            else:
                # Handle requests without valid tenant context
                if self._requires_tenant_context(request):
                    return self._handle_no_tenant_error(request)
                
                # Allow public endpoints without tenant context
                request.tenant = None
                request.tenant_db = None
                
        except Exception as e:
            logger.error(f"Error in tenant middleware: {e}")
            return self._handle_middleware_error(request, e)
    
    def process_response(self, request, response):
        """Process the response and add tenant information to headers."""
        # Add tenant information to response headers (for debugging)
        if hasattr(request, 'tenant') and request.tenant:
            response['X-Tenant-ID'] = str(request.tenant.id)
            response['X-Tenant-Slug'] = request.tenant.slug
        
        # Clean up tenant context
        MultiTenantDBRouter.clear_tenant_db()
        
        return response
    
    def process_exception(self, request, exception):
        """Clean up tenant context even if an exception occurs."""
        MultiTenantDBRouter.clear_tenant_db()
        return None
    
    def _requires_tenant_context(self, request):
        """Check if the request requires a valid tenant context."""
        path = request.path_info
        
        # Public endpoints that don't require tenant context
        public_paths = [
            '/api/v1/auth/',
            '/api/v1/public/',
            '/api/v1/health/',
            '/admin/',
            '/api/schema/',
            '/api/docs/',
        ]
        
        # Check if path starts with any public path
        for public_path in public_paths:
            if path.startswith(public_path):
                return False
        
        # API endpoints generally require tenant context
        if path.startswith('/api/v1/'):
            return True
        
        return False
    
    def _handle_no_tenant_error(self, request):
        """Handle requests that require tenant context but don't have one."""
        hostname = request.META.get('HTTP_HOST', 'unknown')
        
        logger.warning(f"No tenant found for hostname: {hostname}")
        
        return HttpResponse(
            content=f'{{"error": "No tenant found for hostname: {hostname}"}}',
            status=404,
            content_type='application/json'
        )
    
    def _handle_middleware_error(self, request, error):
        """Handle unexpected errors in middleware."""
        logger.error(f"Tenant middleware error: {error}")
        
        return HttpResponse(
            content='{"error": "Internal server error in tenant resolution"}',
            status=500,
            content_type='application/json'
        )


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to add security headers to responses.
    """
    
    def process_response(self, request, response):
        """Add security headers to the response."""
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        return response
