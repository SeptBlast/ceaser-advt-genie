"""
Multi-tenant database router for AdGenius platform.

This router implements the database-per-tenant model as outlined in the architectural blueprint.
It dynamically routes database queries to tenant-specific databases based on the current request context.
"""

import threading
from django.conf import settings
from typing import Optional


class MultiTenantDBRouter:
    """
    Database router that supports multi-tenant architecture with database-per-tenant model.
    
    This router works in conjunction with the TenantMiddleware to ensure that:
    1. All queries are automatically routed to the correct tenant database
    2. Tenant data remains completely isolated
    3. Public data (tenant metadata) remains in the public database
    """
    
    # Thread-local storage for current tenant context
    _local = threading.local()
    
    @classmethod
    def set_tenant_db(cls, tenant_db_name: Optional[str]):
        """Set the current tenant database for this thread."""
        cls._local.tenant_db = tenant_db_name
    
    @classmethod
    def get_tenant_db(cls) -> Optional[str]:
        """Get the current tenant database for this thread."""
        return getattr(cls._local, 'tenant_db', None)
    
    @classmethod
    def clear_tenant_db(cls):
        """Clear the tenant database context."""
        cls._local.tenant_db = None
    
    def db_for_read(self, model, **hints):
        """Return the database to read from for the given model."""
        # Public models always use the default (public) database
        if self._is_public_model(model):
            return 'default'
        
        # Tenant-specific models use the current tenant database
        tenant_db = self.get_tenant_db()
        if tenant_db:
            return tenant_db
        
        # Fallback to default if no tenant context
        return 'default'
    
    def db_for_write(self, model, **hints):
        """Return the database to write to for the given model."""
        # Same logic as read operations
        return self.db_for_read(model, **hints)
    
    def allow_relation(self, obj1, obj2, **hints):
        """Allow relations if models are in the same database."""
        db_set = {obj1._state.db, obj2._state.db}
        
        # Allow relations within the same database
        if len(db_set) == 1:
            return True
        
        # Allow relations between default and tenant databases for foreign keys
        if 'default' in db_set and len(db_set) == 2:
            return True
        
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """Control which models can be migrated to which databases."""
        # Public models can only be migrated to the default database
        if db == 'default':
            return self._is_public_app(app_label)
        
        # Tenant databases should only contain tenant-specific models
        if db.startswith('tenant_'):
            return not self._is_public_app(app_label)
        
        return None
    
    def _is_public_model(self, model):
        """Check if a model should be stored in the public database."""
        if not model or not hasattr(model, '_meta'):
            return True
            
        app_label = model._meta.app_label
        return self._is_public_app(app_label)
    
    def _is_public_app(self, app_label: str) -> bool:
        """Check if an app contains public (shared) models."""
        # Apps that contain public/shared data
        public_apps = {
            'auth',           # Django auth models
            'sessions',       # Django sessions
            'admin',          # Django admin
            'contenttypes',   # Django content types
            'tenants',        # Tenant metadata
            'users',          # User models (shared across tenants)
        }
        
        return app_label in public_apps


class TenantContext:
    """
    Context manager for temporarily setting tenant database context.
    
    Usage:
        with TenantContext('tenant_acme_db'):
            # All database operations within this block will use tenant_acme_db
            campaigns = Campaign.objects.all()
    """
    
    def __init__(self, tenant_db_name: str):
        self.tenant_db_name = tenant_db_name
        self.previous_db = None
    
    def __enter__(self):
        self.previous_db = MultiTenantDBRouter.get_tenant_db()
        MultiTenantDBRouter.set_tenant_db(self.tenant_db_name)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.previous_db:
            MultiTenantDBRouter.set_tenant_db(self.previous_db)
        else:
            MultiTenantDBRouter.clear_tenant_db()
