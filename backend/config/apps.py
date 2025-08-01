"""
Django app configuration for MongoDB initialization.
"""

from django.apps import AppConfig
from django.conf import settings


class MongoConfig(AppConfig):
    """App config for MongoDB initialization."""
    
    name = 'config'
    verbose_name = 'MongoDB Configuration'
    
    def ready(self):
        """Initialize MongoDB connection when Django starts."""
        try:
            from config.settings.base import connect_mongodb
            connect_mongodb()
            print("MongoDB connection established successfully.")
        except Exception as e:
            print(f"MongoDB connection failed: {e}")
