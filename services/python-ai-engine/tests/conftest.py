"""
pytest configuration and shared fixtures for the Python AI Engine test suite.
"""

import os
import pytest
import tempfile
from unittest.mock import Mock, patch, MagicMock
from typing import Dict, Any, List
import asyncio

# Set test environment variables
os.environ["TESTING"] = "true"
os.environ["LOG_LEVEL"] = "debug"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_openai_llm():
    """Mock OpenAI LLM for testing."""
    with patch("app.services.creative_service.ChatOpenAI") as mock:
        mock_instance = Mock()
        mock_instance.invoke.return_value.content = "Generated creative content"
        mock.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def mock_gemini_llm():
    """Mock Gemini LLM for testing."""
    with patch("app.services.creative_service.ChatGoogleGenerativeAI") as mock:
        mock_instance = Mock()
        mock_instance.invoke.return_value.content = "Generated creative content"
        mock.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def mock_video_service():
    """Mock VideoGenerationService for testing."""
    mock_service = Mock()
    mock_service.get_supported_models.return_value = ["runway", "pika", "stability"]
    mock_service.generate_video.return_value = {
        "video_url": "https://example.com/video.mp4",
        "status": "completed",
        "provider": "runway",
    }
    return mock_service


@pytest.fixture
def mock_firebase_storage():
    """Mock Firebase Storage for testing."""
    with patch("app.services.firebase_storage.firebase_admin") as mock_admin:
        with patch("app.services.firebase_storage.storage") as mock_storage:
            mock_bucket = Mock()
            mock_blob = Mock()
            mock_blob.generate_signed_url.return_value = (
                "https://example.com/signed-url"
            )
            mock_blob.public_url = "https://example.com/public-url"
            mock_bucket.blob.return_value = mock_blob
            mock_storage.bucket.return_value = mock_bucket
            yield mock_storage


@pytest.fixture
def mock_grpc_servicer():
    """Mock gRPC servicer for testing."""
    from unittest.mock import AsyncMock

    mock_servicer = Mock()
    mock_servicer.GenerateCreative = AsyncMock()
    mock_servicer.AnalyzeContent = AsyncMock()
    mock_servicer.ExecuteWorkflow = AsyncMock()
    return mock_servicer


@pytest.fixture
def sample_creative_request():
    """Sample creative generation request for testing."""
    return {
        "prompt": "Create an engaging advertisement for a tech startup",
        "type": "video",
        "brand_guidelines": {
            "primary_color": "#FF6B35",
            "secondary_color": "#004E89",
            "brand_voice": "friendly and innovative",
        },
        "target_audience": {
            "age_range": "25-45",
            "interests": ["technology", "innovation"],
            "demographics": "urban professionals",
        },
        "metadata": {"campaign_id": "campaign_123", "user_id": "user_456"},
    }


@pytest.fixture
def sample_video_prompt():
    """Sample video prompt for testing."""
    return {
        "description": "A dynamic shot of a modern workspace with people collaborating",
        "style": "cinematic",
        "duration": 15,
        "aspect_ratio": "16:9",
        "quality": "hd",
    }


@pytest.fixture
def sample_campaign_data():
    """Sample campaign data for testing."""
    return {
        "id": "campaign_123",
        "name": "Tech Startup Launch",
        "description": "Promote our innovative SaaS platform",
        "target_audience": {
            "age_range": "25-45",
            "interests": ["technology", "business"],
            "location": "United States",
        },
        "budget": {"total": 10000, "daily": 500, "currency": "USD"},
        "brand_assets": [{"type": "logo", "url": "https://example.com/logo.png"}],
    }


@pytest.fixture
def mock_http_response():
    """Mock HTTP response for external API calls."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success",
        "data": {
            "video_url": "https://example.com/generated-video.mp4",
            "task_id": "task_123",
        },
    }
    return mock_response


@pytest.fixture
def temp_file():
    """Create a temporary file for testing."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        tmp.write(b"fake video content")
        tmp.flush()
        yield tmp.name
    os.unlink(tmp.name)


@pytest.fixture
def mock_env_vars():
    """Mock environment variables for testing."""
    env_vars = {
        "OPENAI_API_KEY": "test_openai_key",
        "GOOGLE_API_KEY": "test_google_key",
        "RUNWAY_API_KEY": "test_runway_key",
        "PIKA_API_KEY": "test_pika_key",
        "STABILITY_API_KEY": "test_stability_key",
        "LUMA_API_KEY": "test_luma_key",
        "FIREBASE_STORAGE_BUCKET": "test-bucket",
        "FIREBASE_VIDEO_PREFIX": "test-videos",
    }

    with patch.dict(os.environ, env_vars):
        yield env_vars


@pytest.fixture
def mock_structlog():
    """Mock structlog for testing."""
    with patch("app.services.creative_service.structlog") as mock_log:
        mock_logger = Mock()
        mock_log.get_logger.return_value = mock_logger
        yield mock_logger


# Async test helper
def async_test(coro):
    """Helper decorator for async tests."""

    def wrapper(*args, **kwargs):
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(coro(*args, **kwargs))

    return wrapper


# Test data fixtures
@pytest.fixture
def video_provider_responses():
    """Mock responses from video generation providers."""
    return {
        "runway": {
            "id": "runway_task_123",
            "status": "completed",
            "video_url": "https://runway.ml/video/123.mp4",
        },
        "pika": {
            "task_id": "pika_456",
            "state": "finished",
            "result_url": "https://pika.art/video/456.mp4",
        },
        "stability": {
            "generation_id": "stab_789",
            "status": "complete",
            "artifacts": [{"url": "https://stability.ai/video/789.mp4"}],
        },
        "luma": {
            "id": "luma_abc",
            "status": "completed",
            "video": {"url": "https://luma.ai/video/abc.mp4"},
        },
    }


@pytest.fixture
def error_scenarios():
    """Common error scenarios for testing."""
    return {
        "api_key_missing": {"error": "API key not provided", "status_code": 401},
        "rate_limit": {"error": "Rate limit exceeded", "status_code": 429},
        "invalid_prompt": {
            "error": "Prompt violates content policy",
            "status_code": 400,
        },
        "service_unavailable": {
            "error": "Service temporarily unavailable",
            "status_code": 503,
        },
    }


# Cleanup fixture
@pytest.fixture(autouse=True)
def cleanup_after_test():
    """Cleanup after each test."""
    yield
    # Reset any global state if needed
    # Clear caches, close connections, etc.
