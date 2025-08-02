"""
AI-powered ad generation services for AdGenius platform.

This module implements the core creative generation workflow using Google's
Generative AI models (Gemini, Imagen, Veo) as outlined in the architectural blueprint.
"""

import logging
import asyncio
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum
from django.conf import settings
from google.cloud import aiplatform
from google.oauth2 import service_account
from apps.core.plugins import AdCreativeGeneratorPlugin, plugin_registry

logger = logging.getLogger(__name__)


class CreativeType(Enum):
    """Supported creative output types."""
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    MULTIMODAL = "multimodal"


class CreativeFormat(Enum):
    """Supported creative formats."""
    # Text formats
    HEADLINE = "headline"
    SLOGAN = "slogan"
    BODY_COPY = "body_copy"
    SCRIPT = "script"
    
    # Image formats
    BANNER = "banner"
    SOCIAL_POST = "social_post"
    PRODUCT_SHOT = "product_shot"
    
    # Video formats
    SHORT_FORM = "short_form"
    COMMERCIAL = "commercial"
    SOCIAL_VIDEO = "social_video"


@dataclass
class CreativePrompt:
    """Structured prompt for creative generation."""
    text: str
    target_audience: Optional[str] = None
    tone: Optional[str] = None
    brand_guidelines: Optional[Dict[str, Any]] = None
    output_format: Optional[str] = None
    reference_materials: Optional[List[str]] = None
    constraints: Optional[Dict[str, Any]] = None


@dataclass
class GeneratedCreative:
    """Container for generated creative content."""
    content: Union[str, bytes, Dict[str, Any]]
    creative_type: CreativeType
    creative_format: CreativeFormat
    metadata: Dict[str, Any]
    prompt_used: str
    model_used: str
    generation_time: float
    quality_score: Optional[float] = None


class PromptEngineer:
    """
    Advanced prompt engineering for optimal AI model performance.
    
    This class implements the prompt engineering strategies outlined in the blueprint:
    - Role prompting
    - Few-shot learning
    - Structured output
    - Context enhancement
    """
    
    def __init__(self):
        self.role_prompts = {
            CreativeType.TEXT: (
                "You are an expert creative director at a world-class advertising agency "
                "specializing in direct-to-consumer brands. You excel at creating compelling, "
                "conversion-focused copy that resonates with specific target audiences."
            ),
            CreativeType.IMAGE: (
                "You are a master visual creative director with expertise in advertising "
                "photography and design. You create detailed visual concepts that translate "
                "into high-converting visual advertisements."
            ),
            CreativeType.VIDEO: (
                "You are an award-winning creative director specializing in video advertising. "
                "You craft cinematic concepts that tell compelling brand stories and drive action."
            )
        }
    
    def engineer_prompt(self, prompt: CreativePrompt, creative_type: CreativeType) -> str:
        """
        Engineer an optimized prompt for the AI model.
        
        Args:
            prompt: The base creative prompt
            creative_type: Type of creative to generate
            
        Returns:
            Engineered prompt optimized for the specific model and use case
        """
        # Start with role prompt
        engineered_prompt = self.role_prompts.get(creative_type, "")
        
        # Add task-specific instructions
        engineered_prompt += self._add_task_instructions(prompt, creative_type)
        
        # Add context and constraints
        engineered_prompt += self._add_context(prompt)
        
        # Add few-shot examples if available
        engineered_prompt += self._add_few_shot_examples(creative_type, prompt.output_format)
        
        # Add structured output requirements
        engineered_prompt += self._add_output_structure(creative_type, prompt.output_format)
        
        # Add the actual user prompt
        engineered_prompt += f"\n\nUser Request: {prompt.text}"
        
        return engineered_prompt
    
    def _add_task_instructions(self, prompt: CreativePrompt, creative_type: CreativeType) -> str:
        """Add specific task instructions based on creative type."""
        if creative_type == CreativeType.TEXT:
            return (
                "\n\nYour task is to create high-converting advertising copy that:\n"
                "- Captures attention immediately\n"
                "- Clearly communicates value propositions\n"
                "- Includes compelling calls-to-action\n"
                "- Resonates with the target audience's pain points and desires"
            )
        elif creative_type == CreativeType.IMAGE:
            return (
                "\n\nYour task is to create detailed visual concepts for advertising images that:\n"
                "- Are visually striking and attention-grabbing\n"
                "- Clearly showcase the product or service benefits\n"
                "- Follow current design trends and best practices\n"
                "- Are optimized for the specified format and platform"
            )
        elif creative_type == CreativeType.VIDEO:
            return (
                "\n\nYour task is to create compelling video concepts that:\n"
                "- Tell a complete story in the allocated time\n"
                "- Hook viewers within the first 3 seconds\n"
                "- Build emotional connection with the audience\n"
                "- Include clear and compelling calls-to-action"
            )
        return ""
    
    def _add_context(self, prompt: CreativePrompt) -> str:
        """Add context information to the prompt."""
        context = ""
        
        if prompt.target_audience:
            context += f"\n\nTarget Audience: {prompt.target_audience}"
        
        if prompt.tone:
            context += f"\nDesired Tone: {prompt.tone}"
        
        if prompt.brand_guidelines:
            context += f"\nBrand Guidelines: {prompt.brand_guidelines}"
        
        if prompt.constraints:
            context += f"\nConstraints: {prompt.constraints}"
        
        return context
    
    def _add_few_shot_examples(self, creative_type: CreativeType, format_type: Optional[str]) -> str:
        """Add few-shot examples for better model performance."""
        # This would be populated with high-quality examples from the database
        # For now, returning a placeholder
        return "\n\nHere are examples of excellent outputs for reference:\n[Examples would be inserted here]"
    
    def _add_output_structure(self, creative_type: CreativeType, format_type: Optional[str]) -> str:
        """Add structured output requirements."""
        if creative_type == CreativeType.TEXT:
            return (
                "\n\nProvide your response in the following JSON format:\n"
                "{\n"
                '  "headline": "Primary headline",\n'
                '  "body_copy": "Main body text",\n'
                '  "call_to_action": "CTA text",\n'
                '  "variations": ["alternative 1", "alternative 2"],\n'
                '  "rationale": "Brief explanation of creative choices"\n'
                "}"
            )
        elif creative_type == CreativeType.IMAGE:
            return (
                "\n\nProvide your response in the following JSON format:\n"
                "{\n"
                '  "image_prompt": "Detailed description for image generation",\n'
                '  "style_notes": "Specific style and aesthetic directions",\n'
                '  "composition": "Layout and composition details",\n'
                '  "color_palette": "Recommended colors",\n'
                '  "rationale": "Creative reasoning"\n'
                "}"
            )
        return ""


class AdGenerationService:
    """
    Core service for generating advertising creatives using Google's AI models.
    
    This service implements the multi-modal creative generation workflow
    as specified in the architectural blueprint.
    """
    
    def __init__(self):
        """Initialize the ad generation service."""
        self.prompt_engineer = PromptEngineer()
        self._initialize_ai_clients()
    
    def _initialize_ai_clients(self):
        """Initialize Google Cloud AI clients."""
        try:
            # Initialize Vertex AI
            credentials_path = getattr(settings, 'GOOGLE_CLOUD_CREDENTIALS_PATH', None)
            if credentials_path:
                credentials = service_account.Credentials.from_service_account_file(credentials_path)
                aiplatform.init(
                    project=settings.GOOGLE_CLOUD_PROJECT_ID,
                    location=getattr(settings, 'GOOGLE_CLOUD_LOCATION', 'us-central1'),
                    credentials=credentials
                )
            else:
                # Use default credentials (for deployed environments)
                aiplatform.init(
                    project=settings.GOOGLE_CLOUD_PROJECT_ID,
                    location=getattr(settings, 'GOOGLE_CLOUD_LOCATION', 'us-central1')
                )
            
            logger.info("Google Cloud AI clients initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI clients: {e}")
            raise
    
    async def generate_creative(
        self,
        prompt: CreativePrompt,
        creative_type: CreativeType,
        creative_format: CreativeFormat
    ) -> GeneratedCreative:
        """
        Generate a creative based on the provided prompt and specifications.
        
        Args:
            prompt: The creative prompt with requirements
            creative_type: Type of creative to generate
            creative_format: Specific format for the creative
            
        Returns:
            Generated creative with content and metadata
        """
        start_time = asyncio.get_event_loop().time()
        
        try:
            # Engineer the prompt for optimal performance
            engineered_prompt = self.prompt_engineer.engineer_prompt(prompt, creative_type)
            
            # Route to appropriate generation method
            if creative_type == CreativeType.TEXT:
                content = await self._generate_text_creative(engineered_prompt, creative_format)
                model_used = "gemini-pro"
            elif creative_type == CreativeType.IMAGE:
                content = await self._generate_image_creative(engineered_prompt, creative_format)
                model_used = "imagen-3"
            elif creative_type == CreativeType.VIDEO:
                content = await self._generate_video_creative(engineered_prompt, creative_format)
                model_used = "veo"
            else:
                raise ValueError(f"Unsupported creative type: {creative_type}")
            
            generation_time = asyncio.get_event_loop().time() - start_time
            
            # Create the generated creative object
            generated_creative = GeneratedCreative(
                content=content,
                creative_type=creative_type,
                creative_format=creative_format,
                metadata={
                    'original_prompt': prompt.text,
                    'target_audience': prompt.target_audience,
                    'tone': prompt.tone,
                    'brand_guidelines': prompt.brand_guidelines,
                    'constraints': prompt.constraints
                },
                prompt_used=engineered_prompt,
                model_used=model_used,
                generation_time=generation_time
            )
            
            # Store the creative (would integrate with database)
            await self._store_creative(generated_creative)
            
            # Generate and store embeddings for similarity search
            await self._generate_embeddings(generated_creative)
            
            return generated_creative
            
        except Exception as e:
            logger.error(f"Error generating creative: {e}")
            raise
    
    async def _generate_text_creative(self, prompt: str, format_type: CreativeFormat) -> Dict[str, Any]:
        """Generate text-based creative using Gemini."""
        # This would integrate with Google's Gemini API
        # For now, returning a mock response
        return {
            "headline": "AI-Generated Compelling Headline",
            "body_copy": "Engaging body copy that converts...",
            "call_to_action": "Get Started Today",
            "variations": ["Alternative headline 1", "Alternative headline 2"],
            "rationale": "Created to appeal to target demographic with urgency"
        }
    
    async def _generate_image_creative(self, prompt: str, format_type: CreativeFormat) -> Dict[str, Any]:
        """Generate image-based creative using Imagen."""
        # This would integrate with Google's Imagen API
        # For now, returning a mock response
        return {
            "image_url": "https://generated-image-url.com/image.jpg",
            "image_prompt": prompt,
            "dimensions": {"width": 1920, "height": 1080},
            "style_notes": "Modern, clean design with bold colors",
            "composition": "Product centered with dynamic background"
        }
    
    async def _generate_video_creative(self, prompt: str, format_type: CreativeFormat) -> Dict[str, Any]:
        """Generate video-based creative using Veo."""
        # This would integrate with Google's Veo API
        # For now, returning a mock response
        return {
            "video_url": "https://generated-video-url.com/video.mp4",
            "duration": 30,
            "resolution": "1920x1080",
            "script": "Generated video script...",
            "scenes": ["Scene 1: Hook", "Scene 2: Problem", "Scene 3: Solution", "Scene 4: CTA"]
        }
    
    async def _store_creative(self, creative: GeneratedCreative):
        """Store the generated creative in the database."""
        # This would integrate with the database models
        logger.info(f"Storing creative: {creative.creative_type.value}")
    
    async def _generate_embeddings(self, creative: GeneratedCreative):
        """Generate and store vector embeddings for the creative."""
        # This would integrate with the vector database (Qdrant)
        logger.info(f"Generating embeddings for creative: {creative.creative_type.value}")


class GeminiTextGeneratorPlugin(AdCreativeGeneratorPlugin):
    """
    Plugin for text generation using Google's Gemini model.
    
    This plugin implements the AdCreativeGeneratorPlugin interface
    for text-based creative generation.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """Initialize the Gemini text generator plugin."""
        super().__init__(config)
        self.service = AdGenerationService()
    
    def initialize(self):
        """Initialize the plugin."""
        logger.info("Initializing Gemini Text Generator Plugin")
    
    async def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate text creative using Gemini."""
        creative_prompt = CreativePrompt(
            text=prompt,
            target_audience=kwargs.get('target_audience'),
            tone=kwargs.get('tone'),
            brand_guidelines=kwargs.get('brand_guidelines'),
            output_format=kwargs.get('output_format'),
            constraints=kwargs.get('constraints')
        )
        
        creative_format = CreativeFormat(kwargs.get('format', 'headline'))
        
        result = await self.service.generate_creative(
            creative_prompt,
            CreativeType.TEXT,
            creative_format
        )
        
        return {
            'content': result.content,
            'metadata': result.metadata,
            'generation_time': result.generation_time,
            'model_used': result.model_used
        }
    
    def get_supported_formats(self) -> List[str]:
        """Return supported text formats."""
        return ['headline', 'slogan', 'body_copy', 'script']


class ImagenImageGeneratorPlugin(AdCreativeGeneratorPlugin):
    """
    Plugin for image generation using Google's Imagen model.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """Initialize the Imagen generator plugin."""
        super().__init__(config)
        self.service = AdGenerationService()
    
    def initialize(self):
        """Initialize the plugin."""
        logger.info("Initializing Imagen Image Generator Plugin")
    
    async def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate image creative using Imagen."""
        creative_prompt = CreativePrompt(
            text=prompt,
            target_audience=kwargs.get('target_audience'),
            tone=kwargs.get('tone'),
            brand_guidelines=kwargs.get('brand_guidelines'),
            output_format=kwargs.get('output_format'),
            constraints=kwargs.get('constraints')
        )
        
        creative_format = CreativeFormat(kwargs.get('format', 'banner'))
        
        result = await self.service.generate_creative(
            creative_prompt,
            CreativeType.IMAGE,
            creative_format
        )
        
        return {
            'content': result.content,
            'metadata': result.metadata,
            'generation_time': result.generation_time,
            'model_used': result.model_used
        }
    
    def get_supported_formats(self) -> List[str]:
        """Return supported image formats."""
        return ['banner', 'social_post', 'product_shot']


class VeoVideoGeneratorPlugin(AdCreativeGeneratorPlugin):
    """
    Plugin for video generation using Google's Veo model.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """Initialize the Veo generator plugin."""
        super().__init__(config)
        self.service = AdGenerationService()
    
    def initialize(self):
        """Initialize the plugin."""
        logger.info("Initializing Veo Video Generator Plugin")
    
    async def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate video creative using Veo."""
        creative_prompt = CreativePrompt(
            text=prompt,
            target_audience=kwargs.get('target_audience'),
            tone=kwargs.get('tone'),
            brand_guidelines=kwargs.get('brand_guidelines'),
            output_format=kwargs.get('output_format'),
            constraints=kwargs.get('constraints')
        )
        
        creative_format = CreativeFormat(kwargs.get('format', 'short_form'))
        
        result = await self.service.generate_creative(
            creative_prompt,
            CreativeType.VIDEO,
            creative_format
        )
        
        return {
            'content': result.content,
            'metadata': result.metadata,
            'generation_time': result.generation_time,
            'model_used': result.model_used
        }
    
    def get_supported_formats(self) -> List[str]:
        """Return supported video formats."""
        return ['short_form', 'commercial', 'social_video']
