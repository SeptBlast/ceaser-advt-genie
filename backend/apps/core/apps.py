"""
Core Django app configuration.
This app contains shared utilities, base models, and middleware.
"""

from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    verbose_name = 'Core'
    
    def ready(self):
        """
        Initialize app when Django starts.
        """
        # Import signal handlers
        try:
            import apps.core.signals  # noqa F401
        except ImportError:
            pass
