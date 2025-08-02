"""
Django admin configuration for Ad Generation models using MongoDB.

Note: Since we're using MongoDB with MongoEngine, we can't use the standard Django admin.
This file provides documentation and potential future integration points.
"""

from django.contrib import admin

# MongoDB models don't work with Django admin out of the box
# For MongoDB admin interface, consider using:
# 1. MongoDB Compass for direct database management
# 2. Custom admin views using our REST API
# 3. Third-party solutions like Flask-Admin with MongoEngine

# Placeholder admin registration for compatibility
# These won't actually work but prevent import errors

class MongoDBAdminInfo(admin.ModelAdmin):
    """Placeholder admin class for MongoDB models."""
    
    def has_view_permission(self, request, obj=None):
        return False
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False

# Note: For actual MongoDB admin interface, use:
# - Direct API calls to our REST endpoints
# - MongoDB Compass application
# - Custom admin dashboard built with our React frontend
