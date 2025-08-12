"""
Unit tests for CreativeService class.
Tests AI model initialization, prompt generation, and content creation logic.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
import os
from datetime import datetime

from app.services.creative_service import CreativeService


class TestCreativeService:
    """Test suite for CreativeService class."""

    @pytest.fixture
    def creative_service(self, mock_openai_llm, mock_gemini_llm, mock_video_service):
        """Create CreativeService instance with mocked dependencies."""
        with patch(
            "app.services.creative_service.VideoGenerationService",
            return_value=mock_video_service,
        ):
            with patch("app.services.creative_service.PromptRegenerator"):
                service = CreativeService()
                service.openai_llm = mock_openai_llm
                service.gemini_llm = mock_gemini_llm
                service.video_service = mock_video_service
                return service

    def test_init_openai_llm_with_api_key(self):
        """Test OpenAI LLM initialization with valid API key."""
        with patch.dict(os.environ, {"OPENAI_API_KEY": "test_key"}):
            with patch("app.services.creative_service.ChatOpenAI") as mock_chat:
                service = CreativeService()
                mock_chat.assert_called_once_with(
                    api_key="test_key",
                    model="gpt-4o-mini",
                    temperature=0.7,
                    max_tokens=2000,
                )

    def test_init_openai_llm_without_api_key(self):
        """Test OpenAI LLM initialization without API key."""
        with patch.dict(os.environ, {}, clear=True):
            with patch("app.services.creative_service.ChatOpenAI"):
                service = CreativeService()
                assert service.openai_llm is None

    def test_init_gemini_llm_with_api_key(self):
        """Test Gemini LLM initialization with valid API key."""
        with patch.dict(os.environ, {"GOOGLE_API_KEY": "test_google_key"}):
            with patch(
                "app.services.creative_service.ChatGoogleGenerativeAI"
            ) as mock_chat:
                service = CreativeService()
                mock_chat.assert_called_once_with(
                    google_api_key="test_google_key",
                    model="gemini-1.5-flash",
                    temperature=0.7,
                    max_output_tokens=2000,
                )

    def test_init_gemini_llm_without_api_key(self):
        """Test Gemini LLM initialization without API key."""
        with patch.dict(os.environ, {}, clear=True):
            with patch("app.services.creative_service.ChatGoogleGenerativeAI"):
                service = CreativeService()
                assert service.gemini_llm is None

    @pytest.mark.asyncio
    async def test_generate_creative_text_with_openai(
        self, creative_service, sample_creative_request
    ):
        """Test text creative generation using OpenAI."""
        request = sample_creative_request.copy()
        request["type"] = "text"

        creative_service.openai_llm.invoke.return_value.content = (
            "Amazing tech startup ad copy!"
        )

        result = await creative_service.generate_creative(request)

        assert result["success"] is True
        assert result["content"]["text"] == "Amazing tech startup ad copy!"
        assert result["content"]["type"] == "text"
        assert result["content"]["model_used"] == "gpt-4o-mini"
        creative_service.openai_llm.invoke.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_creative_text_with_gemini_fallback(
        self, creative_service, sample_creative_request
    ):
        """Test text creative generation fallback to Gemini when OpenAI fails."""
        request = sample_creative_request.copy()
        request["type"] = "text"

        # Make OpenAI fail
        creative_service.openai_llm = None
        creative_service.gemini_llm.invoke.return_value.content = (
            "Innovative startup marketing content!"
        )

        result = await creative_service.generate_creative(request)

        assert result["success"] is True
        assert result["content"]["text"] == "Innovative startup marketing content!"
        assert result["content"]["model_used"] == "gemini-1.5-flash"
        creative_service.gemini_llm.invoke.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_creative_video(
        self, creative_service, sample_creative_request
    ):
        """Test video creative generation."""
        request = sample_creative_request.copy()
        request["type"] = "video"

        creative_service.video_service.generate_video.return_value = {
            "video_url": "https://example.com/generated-video.mp4",
            "status": "completed",
            "provider": "runway",
        }

        result = await creative_service.generate_creative(request)

        assert result["success"] is True
        assert (
            result["content"]["video_url"] == "https://example.com/generated-video.mp4"
        )
        assert result["content"]["type"] == "video"
        assert result["content"]["provider"] == "runway"
        creative_service.video_service.generate_video.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_creative_image_with_openai(
        self, creative_service, sample_creative_request
    ):
        """Test image creative generation using OpenAI."""
        request = sample_creative_request.copy()
        request["type"] = "image"

        creative_service.openai_llm.invoke.return_value.content = (
            "Detailed image prompt for tech startup"
        )

        with patch("app.services.creative_service.requests.post") as mock_post:
            mock_response = Mock()
            mock_response.json.return_value = {
                "data": [{"url": "https://example.com/generated-image.png"}]
            }
            mock_post.return_value = mock_response

            result = await creative_service.generate_creative(request)

            assert result["success"] is True
            assert (
                result["content"]["image_url"]
                == "https://example.com/generated-image.png"
            )
            assert result["content"]["type"] == "image"

    @pytest.mark.asyncio
    async def test_generate_creative_carousel(
        self, creative_service, sample_creative_request
    ):
        """Test carousel creative generation."""
        request = sample_creative_request.copy()
        request["type"] = "carousel"

        creative_service.openai_llm.invoke.return_value.content = """
        Slide 1: Discover Innovation
        Slide 2: Transform Your Business
        Slide 3: Join the Future
        """

        result = await creative_service.generate_creative(request)

        assert result["success"] is True
        assert result["content"]["type"] == "carousel"
        assert len(result["content"]["slides"]) == 3
        assert "Discover Innovation" in result["content"]["slides"][0]

    @pytest.mark.asyncio
    async def test_generate_creative_no_llm_available(
        self, creative_service, sample_creative_request
    ):
        """Test creative generation when no LLM is available."""
        creative_service.openai_llm = None
        creative_service.gemini_llm = None

        request = sample_creative_request.copy()
        request["type"] = "text"

        result = await creative_service.generate_creative(request)

        assert result["success"] is False
        assert "No LLM available" in result["error"]

    @pytest.mark.asyncio
    async def test_generate_creative_invalid_type(
        self, creative_service, sample_creative_request
    ):
        """Test creative generation with invalid content type."""
        request = sample_creative_request.copy()
        request["type"] = "invalid_type"

        result = await creative_service.generate_creative(request)

        assert result["success"] is False
        assert "Unsupported creative type" in result["error"]

    @pytest.mark.asyncio
    async def test_generate_creative_llm_exception(
        self, creative_service, sample_creative_request
    ):
        """Test handling of LLM exceptions."""
        request = sample_creative_request.copy()
        request["type"] = "text"

        creative_service.openai_llm.invoke.side_effect = Exception(
            "API rate limit exceeded"
        )
        creative_service.gemini_llm = None

        result = await creative_service.generate_creative(request)

        assert result["success"] is False
        assert "API rate limit exceeded" in result["error"]

    def test_get_image_prompt_template(self, creative_service):
        """Test image prompt template generation."""
        prompt_template = creative_service._get_image_prompt()

        assert "brand_guidelines" in prompt_template.template
        assert "target_audience" in prompt_template.template
        assert "prompt" in prompt_template.template

    def test_get_video_prompt_template(self, creative_service):
        """Test video prompt template generation."""
        prompt_template = creative_service._get_video_prompt()

        assert "brand_guidelines" in prompt_template.template
        assert "target_audience" in prompt_template.template
        assert "cinematography" in prompt_template.template

    def test_get_text_prompt_template(self, creative_service):
        """Test text prompt template generation."""
        prompt_template = creative_service._get_text_prompt()

        assert "brand_guidelines" in prompt_template.template
        assert "target_audience" in prompt_template.template
        assert "compelling" in prompt_template.template

    def test_get_carousel_prompt_template(self, creative_service):
        """Test carousel prompt template generation."""
        prompt_template = creative_service._get_carousel_prompt()

        assert "brand_guidelines" in prompt_template.template
        assert "target_audience" in prompt_template.template
        assert "slides" in prompt_template.template

    @pytest.mark.asyncio
    async def test_enhance_prompt(self, creative_service):
        """Test prompt enhancement functionality."""
        original_prompt = "Simple product ad"

        creative_service.prompt_regen.enhance_prompt.return_value = {
            "enhanced_prompt": "Create a compelling product advertisement that showcases innovation",
            "score": 8.5,
            "improvements": ["added emotional appeal", "included call to action"],
        }

        result = await creative_service.enhance_prompt(original_prompt)

        assert result["enhanced_prompt"] != original_prompt
        assert result["score"] > 0
        assert len(result["improvements"]) > 0

    @pytest.mark.asyncio
    async def test_analyze_content_performance(self, creative_service):
        """Test content performance analysis."""
        content_data = {
            "text": "Amazing tech startup solution!",
            "engagement_metrics": {
                "clicks": 150,
                "impressions": 1000,
                "conversions": 15,
            },
        }

        creative_service.openai_llm.invoke.return_value.content = """
        Analysis:
        - High engagement rate of 15%
        - Strong call to action
        - Clear value proposition
        Recommendations:
        - Test shorter headlines
        - Add urgency elements
        """

        result = await creative_service.analyze_content_performance(content_data)

        assert result["success"] is True
        assert "engagement rate" in result["analysis"]
        assert len(result["recommendations"]) > 0

    def test_get_supported_creative_types(self, creative_service):
        """Test getting list of supported creative types."""
        types = creative_service.get_supported_creative_types()

        expected_types = ["text", "image", "video", "carousel"]
        assert all(t in types for t in expected_types)

    def test_validate_creative_request_valid(
        self, creative_service, sample_creative_request
    ):
        """Test validation of valid creative request."""
        is_valid, errors = creative_service.validate_creative_request(
            sample_creative_request
        )

        assert is_valid is True
        assert len(errors) == 0

    def test_validate_creative_request_missing_prompt(
        self, creative_service, sample_creative_request
    ):
        """Test validation of request missing prompt."""
        request = sample_creative_request.copy()
        del request["prompt"]

        is_valid, errors = creative_service.validate_creative_request(request)

        assert is_valid is False
        assert "prompt" in str(errors)

    def test_validate_creative_request_invalid_type(
        self, creative_service, sample_creative_request
    ):
        """Test validation of request with invalid type."""
        request = sample_creative_request.copy()
        request["type"] = "invalid"

        is_valid, errors = creative_service.validate_creative_request(request)

        assert is_valid is False
        assert "type" in str(errors)
