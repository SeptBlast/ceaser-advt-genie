"""
Plugin-based architecture system for AdGenius platform.

This module implements the plugin registry and service discovery system
as outlined in the architectural blueprint. It enables dynamic loading
and configuration of business capability modules.
"""

import logging
import importlib
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Type, Any
from django.conf import settings
from django.apps import apps

logger = logging.getLogger(__name__)


class PluginRegistry:
    """
    Central registry for managing plugins in the AdGenius platform.
    
    This registry implements the service discovery pattern, allowing
    plugins to be dynamically loaded, configured, and accessed throughout
    the application.
    """
    
    _instance = None
    _plugins: Dict[str, Any] = {}
    _plugin_configs: Dict[str, Dict] = {}
    
    def __new__(cls):
        """Singleton pattern to ensure single registry instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def register(self, plugin_name: str, plugin_instance: Any, config: Optional[Dict] = None):
        """
        Register a plugin with the registry.
        
        Args:
            plugin_name: Unique identifier for the plugin
            plugin_instance: The plugin instance to register
            config: Optional configuration dictionary for the plugin
        """
        self._plugins[plugin_name] = plugin_instance
        self._plugin_configs[plugin_name] = config or {}
        
        logger.info(f"Plugin registered: {plugin_name}")
    
    def get(self, plugin_name: str) -> Optional[Any]:
        """
        Retrieve a plugin by name.
        
        Args:
            plugin_name: The name of the plugin to retrieve
            
        Returns:
            The plugin instance or None if not found
        """
        return self._plugins.get(plugin_name)
    
    def get_config(self, plugin_name: str) -> Dict:
        """
        Get configuration for a specific plugin.
        
        Args:
            plugin_name: The name of the plugin
            
        Returns:
            Configuration dictionary for the plugin
        """
        return self._plugin_configs.get(plugin_name, {})
    
    def list_plugins(self) -> List[str]:
        """Get a list of all registered plugin names."""
        return list(self._plugins.keys())
    
    def unregister(self, plugin_name: str):
        """
        Unregister a plugin from the registry.
        
        Args:
            plugin_name: The name of the plugin to unregister
        """
        if plugin_name in self._plugins:
            del self._plugins[plugin_name]
            del self._plugin_configs[plugin_name]
            logger.info(f"Plugin unregistered: {plugin_name}")
    
    def clear(self):
        """Clear all registered plugins."""
        self._plugins.clear()
        self._plugin_configs.clear()
        logger.info("All plugins cleared from registry")


class BasePlugin(ABC):
    """
    Abstract base class for all AdGenius plugins.
    
    This class defines the contract that all plugins must implement,
    ensuring consistency across the plugin architecture.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """
        Initialize the plugin with optional configuration.
        
        Args:
            config: Optional configuration dictionary
        """
        self.config = config or {}
        self.is_enabled = self.config.get('enabled', True)
        self.name = self.__class__.__name__
    
    @abstractmethod
    def initialize(self):
        """
        Initialize the plugin.
        This method is called when the plugin is first loaded.
        """
        pass
    
    @abstractmethod
    def get_capabilities(self) -> List[str]:
        """
        Return a list of capabilities this plugin provides.
        
        Returns:
            List of capability names
        """
        pass
    
    def get_name(self) -> str:
        """Get the plugin name."""
        return self.name
    
    def is_plugin_enabled(self) -> bool:
        """Check if the plugin is enabled."""
        return self.is_enabled
    
    def shutdown(self):
        """
        Clean up plugin resources.
        This method is called when the plugin is being unloaded.
        """
        pass


class AdCreativeGeneratorPlugin(BasePlugin):
    """
    Abstract base class for ad creative generation plugins.
    
    This defines the interface for all creative generation plugins
    like text generation, image generation, video generation, etc.
    """
    
    @abstractmethod
    async def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """
        Generate creative content based on a prompt.
        
        Args:
            prompt: The input prompt for generation
            **kwargs: Additional parameters for generation
            
        Returns:
            Dictionary containing the generated content and metadata
        """
        pass
    
    @abstractmethod
    def get_supported_formats(self) -> List[str]:
        """
        Get list of supported output formats.
        
        Returns:
            List of supported format names
        """
        pass
    
    def get_capabilities(self) -> List[str]:
        """Return capabilities for creative generation plugins."""
        return ['creative_generation'] + self.get_supported_formats()


class AnalyticsPlugin(BasePlugin):
    """
    Abstract base class for analytics plugins.
    
    This defines the interface for analytics and reporting plugins.
    """
    
    @abstractmethod
    def track_event(self, event_name: str, properties: Dict[str, Any]):
        """
        Track an analytics event.
        
        Args:
            event_name: Name of the event to track
            properties: Event properties and metadata
        """
        pass
    
    @abstractmethod
    def get_metrics(self, metric_names: List[str], **filters) -> Dict[str, Any]:
        """
        Retrieve metrics data.
        
        Args:
            metric_names: List of metric names to retrieve
            **filters: Additional filters for the metrics query
            
        Returns:
            Dictionary containing metric data
        """
        pass
    
    def get_capabilities(self) -> List[str]:
        """Return capabilities for analytics plugins."""
        return ['analytics', 'metrics', 'tracking']


class PluginLoader:
    """
    Plugin loader that automatically discovers and loads plugins.
    
    This class handles the discovery of plugins across Django apps
    and their registration with the plugin registry.
    """
    
    def __init__(self, registry: PluginRegistry):
        """
        Initialize the plugin loader.
        
        Args:
            registry: The plugin registry to load plugins into
        """
        self.registry = registry
    
    def load_plugins(self):
        """
        Discover and load all plugins from Django apps.
        
        This method scans all installed Django apps for plugin modules
        and automatically registers any plugins found.
        """
        logger.info("Starting plugin discovery...")
        
        for app_config in apps.get_app_configs():
            self._load_plugins_from_app(app_config)
        
        logger.info(f"Plugin discovery complete. Loaded {len(self.registry.list_plugins())} plugins.")
    
    def _load_plugins_from_app(self, app_config):
        """
        Load plugins from a specific Django app.
        
        Args:
            app_config: Django app configuration object
        """
        try:
            # Try to import the plugins module from the app
            plugins_module_name = f"{app_config.name}.plugins"
            plugins_module = importlib.import_module(plugins_module_name)
            
            # Look for plugin classes in the module
            for attr_name in dir(plugins_module):
                attr = getattr(plugins_module, attr_name)
                
                # Check if it's a plugin class (subclass of BasePlugin)
                if (isinstance(attr, type) and 
                    issubclass(attr, BasePlugin) and 
                    attr is not BasePlugin):
                    
                    self._register_plugin_class(attr, app_config.name)
                    
        except ImportError:
            # No plugins module in this app, skip silently
            pass
        except Exception as e:
            logger.error(f"Error loading plugins from {app_config.name}: {e}")
    
    def _register_plugin_class(self, plugin_class: Type[BasePlugin], app_name: str):
        """
        Register a plugin class with the registry.
        
        Args:
            plugin_class: The plugin class to register
            app_name: Name of the Django app containing the plugin
        """
        try:
            # Get plugin configuration from settings
            plugin_config = self._get_plugin_config(plugin_class.__name__, app_name)
            
            # Only load if enabled
            if plugin_config.get('enabled', True):
                # Instantiate the plugin
                plugin_instance = plugin_class(config=plugin_config)
                
                # Initialize the plugin
                plugin_instance.initialize()
                
                # Register with the registry
                plugin_name = f"{app_name}.{plugin_class.__name__}"
                self.registry.register(plugin_name, plugin_instance, plugin_config)
                
                logger.info(f"Loaded plugin: {plugin_name}")
            else:
                logger.info(f"Plugin disabled: {plugin_class.__name__}")
                
        except Exception as e:
            logger.error(f"Error registering plugin {plugin_class.__name__}: {e}")
    
    def _get_plugin_config(self, plugin_name: str, app_name: str) -> Dict:
        """
        Get configuration for a plugin from Django settings.
        
        Args:
            plugin_name: Name of the plugin class
            app_name: Name of the Django app
            
        Returns:
            Configuration dictionary for the plugin
        """
        # Check for plugin-specific configuration in settings
        plugin_configs = getattr(settings, 'PLUGIN_CONFIGS', {})
        
        # Try app-specific config first, then global config
        config_key = f"{app_name}.{plugin_name}"
        if config_key in plugin_configs:
            return plugin_configs[config_key]
        
        if plugin_name in plugin_configs:
            return plugin_configs[plugin_name]
        
        # Return default configuration
        return {'enabled': True}


# Global plugin registry instance
plugin_registry = PluginRegistry()


def get_plugin(plugin_name: str) -> Optional[Any]:
    """
    Convenience function to get a plugin from the global registry.
    
    Args:
        plugin_name: Name of the plugin to retrieve
        
    Returns:
        The plugin instance or None if not found
    """
    return plugin_registry.get(plugin_name)


def get_plugins_by_capability(capability: str) -> List[Any]:
    """
    Get all plugins that provide a specific capability.
    
    Args:
        capability: The capability to search for
        
    Returns:
        List of plugin instances that provide the capability
    """
    matching_plugins = []
    
    for plugin_name in plugin_registry.list_plugins():
        plugin = plugin_registry.get(plugin_name)
        if plugin and hasattr(plugin, 'get_capabilities'):
            if capability in plugin.get_capabilities():
                matching_plugins.append(plugin)
    
    return matching_plugins
