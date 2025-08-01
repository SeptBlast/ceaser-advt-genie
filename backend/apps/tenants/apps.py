"""
Tenants Django app configuration.
This app handles multi-tenant functionality.
"""

from django.apps import AppConfig


class TenantsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.tenants'
    verbose_name = 'Tenants'
