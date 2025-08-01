"""
Utility functions for the Tenants app.
"""

from django.http import HttpRequest
from typing import Optional
import re


def get_tenant_from_request(request: HttpRequest):
    """
    Extract tenant information from the request.
    
    This function determines the tenant based on:
    1. Subdomain (e.g., acme.adgenius.com)
    2. Custom domain
    3. X-Tenant-Slug header (for API requests)
    
    Args:
        request: The Django HttpRequest object
        
    Returns:
        Tenant instance or None if no tenant found
    """
    from apps.tenants.models import Tenant
    
    # Try to get tenant from header (useful for API requests)
    tenant_slug = request.headers.get('X-Tenant-Slug')
    if tenant_slug:
        try:
            return Tenant.objects.get(slug=tenant_slug, is_active=True)
        except Tenant.DoesNotExist:
            pass
    
    # Try to get tenant from host/domain
    host = request.get_host()
    
    # Remove port if present
    host = host.split(':')[0]
    
    # Check for custom domain
    try:
        return Tenant.objects.get(domain=host, is_active=True)
    except Tenant.DoesNotExist:
        pass
    
    # Check for subdomain pattern (e.g., acme.adgenius.com)
    subdomain_match = extract_subdomain(host)
    if subdomain_match:
        try:
            return Tenant.objects.get(slug=subdomain_match, is_active=True)
        except Tenant.DoesNotExist:
            pass
    
    return None


def extract_subdomain(host: str) -> Optional[str]:
    """
    Extract subdomain from host.
    
    Args:
        host: The host string (e.g., 'acme.adgenius.com')
        
    Returns:
        Subdomain string or None if no subdomain found
    """
    # Define your main domain patterns
    main_domains = [
        r'adgenius\.com$',
        r'localhost$',
        r'127\.0\.0\.1$',
    ]
    
    for domain_pattern in main_domains:
        # Create pattern to match subdomain
        pattern = rf'^([a-z0-9-]+)\.{domain_pattern}'
        match = re.match(pattern, host, re.IGNORECASE)
        if match:
            subdomain = match.group(1)
            # Exclude common non-tenant subdomains
            if subdomain not in ['www', 'api', 'admin', 'app']:
                return subdomain.lower()
    
    return None


def get_tenant_database_name(tenant_slug: str) -> str:
    """
    Generate database name for a tenant.
    
    Args:
        tenant_slug: The tenant's slug
        
    Returns:
        Database name string
    """
    return f"tenant_{tenant_slug}_db"


def validate_tenant_slug(slug: str) -> bool:
    """
    Validate tenant slug format.
    
    Args:
        slug: The slug to validate
        
    Returns:
        True if valid, False otherwise
    """
    # Check length
    if len(slug) < 3 or len(slug) > 50:
        return False
    
    # Check format (lowercase letters, numbers, hyphens only)
    if not re.match(r'^[a-z0-9-]+$', slug):
        return False
    
    # Check that it doesn't start or end with hyphen
    if slug.startswith('-') or slug.endswith('-'):
        return False
    
    # Check for reserved words
    reserved_words = [
        'admin', 'api', 'app', 'www', 'mail', 'ftp', 'blog',
        'help', 'support', 'docs', 'status', 'about', 'contact',
        'privacy', 'terms', 'legal', 'security', 'billing'
    ]
    
    if slug in reserved_words:
        return False
    
    return True


def create_tenant_database(tenant):
    """
    Create a new database for a tenant.
    
    This is a placeholder function that would implement the actual
    database creation logic based on your database setup.
    
    Args:
        tenant: Tenant instance
    """
    # This would be implemented based on your specific database setup
    # For MongoDB with separate databases per tenant:
    
    from pymongo import MongoClient
    from django.conf import settings
    
    try:
        # Get MongoDB connection settings
        db_config = settings.DATABASES['default']['CLIENT']
        
        # Create MongoDB client
        client = MongoClient(
            host=db_config['host'],
            port=db_config['port'],
            username=db_config.get('username'),
            password=db_config.get('password'),
            authSource=db_config.get('authSource', 'admin')
        )
        
        # Create tenant database
        tenant_db = client[tenant.database_name]
        
        # Create an initial collection to ensure database is created
        tenant_db.create_collection('_tenant_info')
        
        # Store tenant metadata
        tenant_db._tenant_info.insert_one({
            'tenant_id': str(tenant.id),
            'tenant_slug': tenant.slug,
            'created_at': tenant.created_at,
            'database_version': '1.0'
        })
        
        client.close()
        
        return True
        
    except Exception as e:
        # Log the error
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create database for tenant {tenant.slug}: {e}")
        return False


def delete_tenant_database(tenant):
    """
    Delete a tenant's database.
    
    Args:
        tenant: Tenant instance
    """
    from pymongo import MongoClient
    from django.conf import settings
    
    try:
        # Get MongoDB connection settings
        db_config = settings.DATABASES['default']['CLIENT']
        
        # Create MongoDB client
        client = MongoClient(
            host=db_config['host'],
            port=db_config['port'],
            username=db_config.get('username'),
            password=db_config.get('password'),
            authSource=db_config.get('authSource', 'admin')
        )
        
        # Drop tenant database
        client.drop_database(tenant.database_name)
        
        client.close()
        
        return True
        
    except Exception as e:
        # Log the error
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to delete database for tenant {tenant.slug}: {e}")
        return False
