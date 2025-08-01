"""
Core services for the AdGenius platform.
These services provide shared functionality across all apps.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class BaseService(ABC):
    """
    Abstract base class for all services in the platform.
    Implements common patterns and provides a consistent interface.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__module__)
    
    def log_operation(self, operation: str, **kwargs):
        """
        Log service operations for debugging and monitoring.
        """
        self.logger.info(f"{self.__class__.__name__}: {operation}", extra=kwargs)


class CacheService(BaseService):
    """
    Service for handling caching operations.
    """
    
    def __init__(self, cache_backend=None):
        super().__init__()
        from django.core.cache import cache
        self.cache = cache_backend or cache
    
    def get(self, key: str, default=None):
        """
        Get value from cache.
        """
        try:
            return self.cache.get(key, default)
        except Exception as e:
            self.logger.error(f"Cache get error for key {key}: {e}")
            return default
    
    def set(self, key: str, value: Any, timeout: Optional[int] = None):
        """
        Set value in cache.
        """
        try:
            return self.cache.set(key, value, timeout)
        except Exception as e:
            self.logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str):
        """
        Delete value from cache.
        """
        try:
            return self.cache.delete(key)
        except Exception as e:
            self.logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    def get_or_set(self, key: str, default_callable, timeout: Optional[int] = None):
        """
        Get value from cache or set it using the default callable.
        """
        value = self.get(key)
        if value is None:
            value = default_callable()
            self.set(key, value, timeout)
        return value


class EventService(BaseService):
    """
    Service for handling event-driven communication.
    """
    
    def __init__(self):
        super().__init__()
        self.event_handlers = {}
    
    def register_handler(self, event_type: str, handler_func):
        """
        Register an event handler for a specific event type.
        """
        if event_type not in self.event_handlers:
            self.event_handlers[event_type] = []
        self.event_handlers[event_type].append(handler_func)
    
    def emit_event(self, event_type: str, data: Dict[str, Any]):
        """
        Emit an event to all registered handlers.
        """
        self.log_operation(f"Emitting event: {event_type}", data=data)
        
        handlers = self.event_handlers.get(event_type, [])
        for handler in handlers:
            try:
                handler(data)
            except Exception as e:
                self.logger.error(f"Error in event handler for {event_type}: {e}")


class ValidationService(BaseService):
    """
    Service for common validation operations.
    """
    
    @staticmethod
    def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> List[str]:
        """
        Validate that required fields are present in data.
        Returns list of missing fields.
        """
        missing_fields = []
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                missing_fields.append(field)
        return missing_fields
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """
        Validate email format.
        """
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_url(url: str) -> bool:
        """
        Validate URL format.
        """
        import re
        pattern = r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$'
        return re.match(pattern, url) is not None
