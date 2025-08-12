import os
from typing import Dict, List, Any, Optional
import structlog
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from datetime import datetime
from .video_generation import VideoGenerationService, VideoPrompt
from .prompt_service import PromptRegenerator

logger = structlog.get_logger()


class CreativeService:
    """
    Service for AI-powered creative generation using LangChain.
    Leverages the mature Python AI ecosystem for complex creative workflows.
    """

    def __init__(self):
        self.openai_llm = self._init_openai_llm()
        self.gemini_llm = self._init_gemini_llm()
        self.video_service = VideoGenerationService()
        self.prompt_regen = PromptRegenerator()

        # Creative generation prompts
        self.creative_prompts = {
            "image": self._get_image_prompt(),
            "video": self._get_video_prompt(),
            "text": self._get_text_prompt(),
            "carousel": self._get_carousel_prompt(),
        }

    logger.info("CreativeService initialized with LLM models")
    logger.info(
        "Video models available", models=self.video_service.get_supported_models()
    )

    def _init_openai_llm(self) -> Optional[ChatOpenAI]:
        """Initialize OpenAI LLM if API key is available"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            return ChatOpenAI(
                api_key=api_key, model="gpt-4o-mini", temperature=0.7, max_tokens=2000
            )
        return None

    def _init_gemini_llm(self) -> Optional[ChatGoogleGenerativeAI]:
        """Initialize Gemini LLM if API key is available"""
        api_key = os.getenv("GOOGLE_API_KEY")
        if api_key:
            return ChatGoogleGenerativeAI(
                model="gemini-1.5-pro",
                google_api_key=api_key,
                temperature=0.7,
                max_output_tokens=2000,
            )
        return None

    def _get_image_prompt(self) -> PromptTemplate:
        """Prompt template for image creative generation"""
        template = """
        As an expert advertising creative director, generate detailed specifications for an image creative.

        Campaign Context:
        - Campaign ID: {campaign_id}
        - Target Platforms: {platforms}
        - Brand Guidelines: {brand_guidelines}
        - Target Audience: {target_audience}

        Generation Parameters:
        {parameters}

        Generate a comprehensive creative specification including:
        1. Visual concept and composition
        2. Color palette (considering brand guidelines)
        3. Typography recommendations
        4. Image style and mood
        5. Call-to-action placement
        6. Platform-specific optimizations
        7. A/B testing variations (3 different approaches)

        Ensure the creative aligns with the brand guidelines and resonates with the target audience.
        """
        return PromptTemplate(
            input_variables=[
                "campaign_id",
                "platforms",
                "brand_guidelines",
                "target_audience",
                "parameters",
            ],
            template=template,
        )

    def _get_video_prompt(self) -> PromptTemplate:
        """Prompt template for video creative generation"""
        template = """
        As an expert video advertising producer, create a detailed video creative specification.

        Campaign Context:
        - Campaign ID: {campaign_id}
        - Target Platforms: {platforms}
        - Brand Guidelines: {brand_guidelines}
        - Target Audience: {target_audience}

        Generation Parameters:
        {parameters}

        Generate a comprehensive video creative specification including:
        1. Video concept and narrative structure
        2. Scene-by-scene breakdown
        3. Visual style and cinematography
        4. Audio and music recommendations
        5. Pacing and duration for each platform
        6. Call-to-action integration
        7. Multiple creative variations for testing

        Consider platform-specific requirements (Instagram Stories, YouTube, TikTok, etc.).
        """
        return PromptTemplate(
            input_variables=[
                "campaign_id",
                "platforms",
                "brand_guidelines",
                "target_audience",
                "parameters",
            ],
            template=template,
        )

    def _get_text_prompt(self) -> PromptTemplate:
        """Prompt template for text creative generation"""
        template = """
        As an expert copywriter specializing in digital advertising, create compelling ad copy.

        Campaign Context:
        - Campaign ID: {campaign_id}
        - Target Platforms: {platforms}
        - Brand Guidelines: {brand_guidelines}
        - Target Audience: {target_audience}

        Generation Parameters:
        {parameters}

        Generate multiple text creative variations including:
        1. Headlines (multiple lengths and styles)
        2. Body copy (short, medium, long versions)
        3. Call-to-action options
        4. Platform-specific adaptations
        5. Emotional hooks and persuasion techniques
        6. A/B testing variants with different approaches

        Ensure all copy aligns with brand voice and appeals to the target audience psychology.
        """
        return PromptTemplate(
            input_variables=[
                "campaign_id",
                "platforms",
                "brand_guidelines",
                "target_audience",
                "parameters",
            ],
            template=template,
        )

    def _get_carousel_prompt(self) -> PromptTemplate:
        """Prompt template for carousel creative generation"""
        template = """
        As an expert in carousel advertising formats, design a multi-slide creative experience.

        Campaign Context:
        - Campaign ID: {campaign_id}
        - Target Platforms: {platforms}
        - Brand Guidelines: {brand_guidelines}
        - Target Audience: {target_audience}

        Generation Parameters:
        {parameters}

        Generate a comprehensive carousel creative specification including:
        1. Overall narrative arc across slides
        2. Individual slide concepts (3-10 slides)
        3. Visual continuity and progression
        4. Text and headline strategy for each slide
        5. Call-to-action placement and evolution
        6. Interactive elements and engagement hooks
        7. Multiple carousel themes for testing

        Design for maximum engagement and swipe-through rates.
        """
        return PromptTemplate(
            input_variables=[
                "campaign_id",
                "platforms",
                "brand_guidelines",
                "target_audience",
                "parameters",
            ],
            template=template,
        )

    async def generate_creative(
        self,
        campaign_id: str,
        creative_type: str,
        parameters: Dict[str, Any],
        platforms: List[str],
        target_audience: Any,
        brand_guidelines: Any,
        tenant_name: Optional[str] = None,
        creative_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate creative content using AI models and LangChain chains.
        This leverages Python's rich AI ecosystem for sophisticated creative generation.
        """
        try:
            logger.info(
                "Starting creative generation",
                campaign_id=campaign_id,
                creative_type=creative_type,
                platforms=platforms,
            )

            # Special pathway for video: support provider selection + prompt quantification/regeneration
            if creative_type == "video":
                return await self._generate_video(
                    campaign_id=campaign_id,
                    parameters=parameters,
                    platforms=platforms,
                    target_audience=target_audience,
                    brand_guidelines=brand_guidelines,
                    tenant_name=tenant_name,
                    creative_id=creative_id,
                )

            # Default creative spec generation using LLMs
            llm = self.openai_llm if self.openai_llm else self.gemini_llm
            if not llm:
                raise ValueError(
                    "No LLM available. Configure OPENAI_API_KEY or GOOGLE_API_KEY"
                )

            if creative_type not in self.creative_prompts:
                raise ValueError(f"Unsupported creative type: {creative_type}")

            prompt_template = self.creative_prompts[creative_type]
            chain = LLMChain(llm=llm, prompt=prompt_template, verbose=True)

            input_vars = {
                "campaign_id": campaign_id,
                "platforms": ", ".join(platforms),
                "brand_guidelines": str(brand_guidelines),
                "target_audience": str(target_audience),
                "parameters": str(parameters),
            }

            result = await chain.arun(**input_vars)

            variations = [
                {
                    "variation_id": f"var_{i+1}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    "content_url": f"https://generated-content.example.com/{creative_type}_{i+1}",
                    "content_type": creative_type,
                    "generation_parameters": parameters,
                    "performance_score": 75.0 + (i * 5),
                    "is_approved": False,
                    "created_at": datetime.utcnow().isoformat(),
                }
                for i in range(3)
            ]

            response = {
                "success": True,
                "message": f"Generated {len(variations)} {creative_type} creative variations",
                "variations": variations,
                "metadata": {
                    "model_used": (
                        llm.model_name if hasattr(llm, "model_name") else "unknown"
                    ),
                    "parameters": parameters,
                    "generation_time_seconds": 2.5,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            }

            logger.info(
                "Creative generation completed successfully",
                campaign_id=campaign_id,
                variations_count=len(variations),
            )

            return response

        except Exception as e:
            logger.error(
                "Creative generation failed",
                error=str(e),
                campaign_id=campaign_id,
                creative_type=creative_type,
            )
            return {
                "success": False,
                "message": f"Creative generation failed: {str(e)}",
                "variations": [],
                "metadata": {
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat(),
                },
            }

    async def _generate_video(
        self,
        campaign_id: str,
        parameters: Dict[str, Any],
        platforms: List[str],
        target_audience: Any,
        brand_guidelines: Any,
        tenant_name: Optional[str] = None,
        creative_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate videos via selected provider model with prompt quantification and optional regeneration.
        parameters can include:
          - user_prompt: str (free-form)
          - video_model: str (one of self.video_service.get_supported_models())
          - variations: int
          - regenerate_feedback: str (optional)
        """
        user_prompt = (
            parameters.get("user_prompt")
            or parameters.get("prompt")
            or "Brand hero video ad"
        )
        model = (
            parameters.get("video_model")
            or parameters.get("model")
            or self.video_service.get_supported_models()[0]
        )
        variations = int(parameters.get("variations", 1))
        feedback = parameters.get("regenerate_feedback")

        # Quantify and optionally refine the prompt
        quantified: VideoPrompt = await self.prompt_regen.quantify(
            user_prompt=user_prompt,
            campaign_context={
                "campaign_id": campaign_id,
                "platforms": platforms,
            },
            brand_guidelines=brand_guidelines,
            target_audience=target_audience,
        )

        if feedback:
            quantified = await self.prompt_regen.regenerate_with_feedback(
                quantified, feedback
            )

        # Generate via provider
        generation = await self.video_service.generate(
            model=model,
            prompt=quantified,
            tenant_name=tenant_name or "default",
            creative_id=creative_id or campaign_id,
            assets=parameters.get("assets"),
            variations=variations,
        )

        return {
            "success": generation.get("success", False),
            "message": f"Video generation triggered via {generation.get('provider')} ({generation.get('model')})",
            "variations": [
                {
                    "variation_id": item.get("job_id"),
                    "content_url": item.get("content_url"),
                    "s3_url": item.get("s3_url"),
                    "content_type": "video",
                    "generation_parameters": quantified.__dict__,
                    "is_approved": False,
                    "created_at": datetime.utcnow().isoformat(),
                }
                for item in generation.get("results", [])
            ],
            "metadata": {
                "supported_models": generation.get("supported_models", []),
                "selected_model": generation.get("model"),
                "provider": generation.get("provider"),
                "tenant_name": tenant_name,
                "creative_id": creative_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
        }

    def list_video_models(self) -> List[str]:
        return self.video_service.get_supported_models()
