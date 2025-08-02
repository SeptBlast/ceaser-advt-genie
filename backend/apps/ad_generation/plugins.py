"""
Ad generation plugins for the AdGenius platform.

This module contains all the creative generation plugins that implement
the plugin architecture defined in the core system.
"""

from apps.ad_generation.services import (
    GeminiTextGeneratorPlugin,
    ImagenImageGeneratorPlugin,
    VeoVideoGeneratorPlugin
)

# Export plugins for auto-discovery by the plugin loader
__all__ = [
    'GeminiTextGeneratorPlugin',
    'ImagenImageGeneratorPlugin', 
    'VeoVideoGeneratorPlugin'
]
