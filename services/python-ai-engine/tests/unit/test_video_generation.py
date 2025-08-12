"""
Unit tests for VideoGenerationService class.
Tests video provider adapters, request handling, and error scenarios.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
import asyncio
from datetime import datetime

from app.services.video_generation import VideoGenerationService, VideoPrompt


class TestVideoGenerationService:
    """Test suite for VideoGenerationService class."""

    @pytest.fixture
    def video_service(self):
        """Create VideoGenerationService instance."""
        return VideoGenerationService()

    @pytest.fixture
    def sample_video_prompt(self):
        """Sample video prompt for testing."""
        return VideoPrompt(
            description="A modern office with people working collaboratively",
            style="cinematic",
            duration=15,
            aspect_ratio="16:9",
            quality="hd",
        )

    def test_get_supported_models(self, video_service):
        """Test getting list of supported video generation models."""
        models = video_service.get_supported_models()

        expected_models = [
            "runway",
            "pika",
            "stability",
            "luma",
            "google_veo",
            "openai_sora",
        ]
        assert all(model in models for model in expected_models)
        assert len(models) >= 6

    def test_select_best_provider_default(self, video_service, sample_video_prompt):
        """Test provider selection with default preferences."""
        provider = video_service._select_best_provider(sample_video_prompt)

        # Should default to runway for general content
        assert provider == "runway"

    def test_select_best_provider_long_duration(
        self, video_service, sample_video_prompt
    ):
        """Test provider selection for long duration videos."""
        sample_video_prompt.duration = 45
        provider = video_service._select_best_provider(sample_video_prompt)

        # Longer videos should prefer certain providers
        assert provider in ["runway", "pika", "luma"]

    def test_select_best_provider_cinematic_style(
        self, video_service, sample_video_prompt
    ):
        """Test provider selection for cinematic style."""
        sample_video_prompt.style = "cinematic"
        provider = video_service._select_best_provider(sample_video_prompt)

        # Cinematic content should prefer quality providers
        assert provider in ["runway", "stability", "google_veo"]

    @pytest.mark.asyncio
    async def test_generate_video_runway_success(
        self, video_service, sample_video_prompt
    ):
        """Test successful video generation with Runway."""
        with patch("app.services.video_generation.requests.post") as mock_post:
            # Mock initial request
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {
                "id": "runway_task_123",
                "status": "processing",
            }

            with patch("app.services.video_generation.requests.get") as mock_get:
                # Mock status check
                mock_get.return_value.status_code = 200
                mock_get.return_value.json.return_value = {
                    "id": "runway_task_123",
                    "status": "completed",
                    "video_url": "https://runway.ml/video/123.mp4",
                }

                result = await video_service.generate_video(
                    sample_video_prompt, provider="runway"
                )

                assert result["success"] is True
                assert result["video_url"] == "https://runway.ml/video/123.mp4"
                assert result["provider"] == "runway"
                assert result["status"] == "completed"

    @pytest.mark.asyncio
    async def test_generate_video_pika_success(
        self, video_service, sample_video_prompt
    ):
        """Test successful video generation with Pika."""
        with patch("app.services.video_generation.requests.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {
                "task_id": "pika_456",
                "state": "processing",
            }

            with patch("app.services.video_generation.requests.get") as mock_get:
                mock_get.return_value.status_code = 200
                mock_get.return_value.json.return_value = {
                    "task_id": "pika_456",
                    "state": "finished",
                    "result_url": "https://pika.art/video/456.mp4",
                }

                result = await video_service.generate_video(
                    sample_video_prompt, provider="pika"
                )

                assert result["success"] is True
                assert result["video_url"] == "https://pika.art/video/456.mp4"
                assert result["provider"] == "pika"

    @pytest.mark.asyncio
    async def test_generate_video_stability_success(
        self, video_service, sample_video_prompt
    ):
        """Test successful video generation with Stability AI."""
        with patch("app.services.video_generation.requests.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {
                "generation_id": "stab_789",
                "status": "processing",
            }

            with patch("app.services.video_generation.requests.get") as mock_get:
                mock_get.return_value.status_code = 200
                mock_get.return_value.json.return_value = {
                    "generation_id": "stab_789",
                    "status": "complete",
                    "artifacts": [{"url": "https://stability.ai/video/789.mp4"}],
                }

                result = await video_service.generate_video(
                    sample_video_prompt, provider="stability"
                )

                assert result["success"] is True
                assert result["video_url"] == "https://stability.ai/video/789.mp4"
                assert result["provider"] == "stability"

    @pytest.mark.asyncio
    async def test_generate_video_auto_provider_selection(
        self, video_service, sample_video_prompt
    ):
        """Test automatic provider selection."""
        with patch.object(video_service, "_generate_runway_video") as mock_runway:
            mock_runway.return_value = {
                "success": True,
                "video_url": "https://runway.ml/video/auto.mp4",
                "provider": "runway",
                "status": "completed",
            }

            result = await video_service.generate_video(sample_video_prompt)

            assert result["success"] is True
            assert result["provider"] == "runway"
            mock_runway.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_video_provider_fallback(
        self, video_service, sample_video_prompt
    ):
        """Test fallback to alternative provider when primary fails."""
        with patch.object(video_service, "_generate_runway_video") as mock_runway:
            with patch.object(video_service, "_generate_pika_video") as mock_pika:
                # Make runway fail
                mock_runway.return_value = {
                    "success": False,
                    "error": "Provider temporarily unavailable",
                }

                # Make pika succeed
                mock_pika.return_value = {
                    "success": True,
                    "video_url": "https://pika.art/video/fallback.mp4",
                    "provider": "pika",
                    "status": "completed",
                }

                result = await video_service.generate_video(
                    sample_video_prompt, provider="runway"
                )

                assert result["success"] is True
                assert result["provider"] == "pika"
                mock_runway.assert_called_once()
                mock_pika.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_video_all_providers_fail(
        self, video_service, sample_video_prompt
    ):
        """Test handling when all providers fail."""
        with patch("app.services.video_generation.requests.post") as mock_post:
            mock_post.return_value.status_code = 500
            mock_post.return_value.json.return_value = {"error": "Service unavailable"}

            result = await video_service.generate_video(sample_video_prompt)

            assert result["success"] is False
            assert "error" in result

    @pytest.mark.asyncio
    async def test_generate_video_timeout(self, video_service, sample_video_prompt):
        """Test handling of generation timeout."""
        with patch("app.services.video_generation.requests.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {
                "id": "timeout_task",
                "status": "processing",
            }

            with patch("app.services.video_generation.requests.get") as mock_get:
                # Always return processing status to simulate timeout
                mock_get.return_value.status_code = 200
                mock_get.return_value.json.return_value = {
                    "id": "timeout_task",
                    "status": "processing",
                }

                with patch("asyncio.sleep"):  # Speed up test
                    result = await video_service.generate_video(
                        sample_video_prompt,
                        provider="runway",
                        timeout=1,  # Very short timeout for test
                    )

                    assert result["success"] is False
                    assert "timeout" in result["error"].lower()

    def test_validate_video_prompt_valid(self, video_service, sample_video_prompt):
        """Test validation of valid video prompt."""
        is_valid, errors = video_service.validate_video_prompt(sample_video_prompt)

        assert is_valid is True
        assert len(errors) == 0

    def test_validate_video_prompt_missing_description(self, video_service):
        """Test validation with missing description."""
        invalid_prompt = VideoPrompt(
            description="", style="cinematic", duration=15  # Empty description
        )

        is_valid, errors = video_service.validate_video_prompt(invalid_prompt)

        assert is_valid is False
        assert "description" in str(errors)

    def test_validate_video_prompt_invalid_duration(self, video_service):
        """Test validation with invalid duration."""
        invalid_prompt = VideoPrompt(
            description="Test video", duration=0  # Invalid duration
        )

        is_valid, errors = video_service.validate_video_prompt(invalid_prompt)

        assert is_valid is False
        assert "duration" in str(errors)

    def test_validate_video_prompt_invalid_aspect_ratio(self, video_service):
        """Test validation with invalid aspect ratio."""
        invalid_prompt = VideoPrompt(
            description="Test video", aspect_ratio="invalid_ratio"
        )

        is_valid, errors = video_service.validate_video_prompt(invalid_prompt)

        assert is_valid is False
        assert "aspect_ratio" in str(errors)

    @pytest.mark.asyncio
    async def test_get_generation_status(self, video_service):
        """Test getting generation status."""
        task_id = "test_task_123"
        provider = "runway"

        with patch("app.services.video_generation.requests.get") as mock_get:
            mock_get.return_value.status_code = 200
            mock_get.return_value.json.return_value = {
                "id": task_id,
                "status": "processing",
                "progress": 75,
            }

            status = await video_service.get_generation_status(task_id, provider)

            assert status["status"] == "processing"
            assert status["progress"] == 75

    @pytest.mark.asyncio
    async def test_cancel_generation(self, video_service):
        """Test canceling video generation."""
        task_id = "test_task_123"
        provider = "runway"

        with patch("app.services.video_generation.requests.delete") as mock_delete:
            mock_delete.return_value.status_code = 200
            mock_delete.return_value.json.return_value = {
                "id": task_id,
                "status": "cancelled",
            }

            result = await video_service.cancel_generation(task_id, provider)

            assert result["success"] is True
            assert result["status"] == "cancelled"

    def test_get_provider_capabilities(self, video_service):
        """Test getting provider capabilities."""
        capabilities = video_service.get_provider_capabilities()

        assert "runway" in capabilities
        assert "pika" in capabilities
        assert "max_duration" in capabilities["runway"]
        assert "supported_aspect_ratios" in capabilities["runway"]

    def test_estimate_generation_time(self, video_service, sample_video_prompt):
        """Test generation time estimation."""
        estimated_time = video_service.estimate_generation_time(
            sample_video_prompt, "runway"
        )

        assert isinstance(estimated_time, (int, float))
        assert estimated_time > 0

    def test_calculate_cost_estimate(self, video_service, sample_video_prompt):
        """Test cost estimation for video generation."""
        cost = video_service.calculate_cost_estimate(sample_video_prompt, "runway")

        assert isinstance(cost, (int, float))
        assert cost >= 0

    @pytest.mark.asyncio
    async def test_generate_video_with_webhook(
        self, video_service, sample_video_prompt
    ):
        """Test video generation with webhook callback."""
        webhook_url = "https://example.com/webhook"

        with patch("app.services.video_generation.requests.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {
                "id": "webhook_task",
                "status": "processing",
                "webhook_url": webhook_url,
            }

            result = await video_service.generate_video(
                sample_video_prompt, provider="runway", webhook_url=webhook_url
            )

            # Check that webhook URL was included in request
            call_args = mock_post.call_args
            assert webhook_url in str(call_args)

    def test_video_prompt_dataclass(self):
        """Test VideoPrompt dataclass functionality."""
        prompt = VideoPrompt(
            description="Test description",
            style="realistic",
            duration=10,
            aspect_ratio="16:9",
            quality="hd",
        )

        assert prompt.description == "Test description"
        assert prompt.style == "realistic"
        assert prompt.duration == 10
        assert prompt.aspect_ratio == "16:9"
        assert prompt.quality == "hd"
