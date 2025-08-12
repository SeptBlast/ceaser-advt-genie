"""
Test utilities and helper functions for Python AI Engine tests.
Provides common testing functionality, validation helpers, and assertion utilities.
"""

import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Callable, Union
from unittest.mock import AsyncMock, MagicMock
from contextlib import asynccontextmanager

import pytest
import structlog
from google.cloud import firestore
from firebase_admin import storage


class AsyncContextManager:
    """Helper for creating async context managers in tests."""

    def __init__(self, return_value=None):
        self.return_value = return_value

    async def __aenter__(self):
        return self.return_value

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass


class MockAsyncGenerator:
    """Mock async generator for streaming responses."""

    def __init__(self, items: List[Any]):
        self.items = items
        self.index = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.index >= len(self.items):
            raise StopAsyncIteration
        item = self.items[self.index]
        self.index += 1
        await asyncio.sleep(0.01)  # Simulate async delay
        return item


class MockStreamingResponse:
    """Mock streaming response for async API calls."""

    def __init__(self, chunks: List[str]):
        self.chunks = chunks
        self.index = 0

    async def __aiter__(self):
        for chunk in self.chunks:
            await asyncio.sleep(0.01)
            yield chunk


class PerformanceTimer:
    """Context manager for measuring execution time."""

    def __init__(self, name: str = "operation"):
        self.name = name
        self.start_time = None
        self.end_time = None
        self.duration = None

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.time()
        self.duration = self.end_time - self.start_time


def assert_within_time_limit(func: Callable, max_time: float, *args, **kwargs) -> Any:
    """Assert that a function executes within the specified time limit."""
    with PerformanceTimer() as timer:
        result = func(*args, **kwargs)

    assert (
        timer.duration <= max_time
    ), f"Function took {timer.duration:.2f}s, expected <= {max_time}s"
    return result


async def assert_async_within_time_limit(
    coro: Callable, max_time: float, *args, **kwargs
) -> Any:
    """Assert that an async function executes within the specified time limit."""
    start_time = time.time()
    result = await coro(*args, **kwargs)
    duration = time.time() - start_time

    assert (
        duration <= max_time
    ), f"Async function took {duration:.2f}s, expected <= {max_time}s"
    return result


def validate_creative_response(response: Dict[str, Any]) -> None:
    """Validate that a creative generation response has the expected structure."""
    required_fields = ["id", "content", "type", "status", "created_at"]

    for field in required_fields:
        assert field in response, f"Missing required field: {field}"

    assert isinstance(response["id"], str), "ID should be a string"
    assert len(response["id"]) > 0, "ID should not be empty"

    assert response["type"] in [
        "text",
        "image",
        "video",
    ], f"Invalid type: {response['type']}"
    assert response["status"] in [
        "pending",
        "processing",
        "completed",
        "failed",
    ], f"Invalid status: {response['status']}"

    if response["status"] == "completed":
        assert "content" in response, "Completed response should have content"
        if response["type"] == "text":
            assert isinstance(
                response["content"], str
            ), "Text content should be a string"
        elif response["type"] in ["image", "video"]:
            assert "url" in response["content"], "Media content should have URL"


def validate_video_generation_response(response: Dict[str, Any]) -> None:
    """Validate that a video generation response has the expected structure."""
    required_fields = ["task_id", "status", "created_at"]

    for field in required_fields:
        assert field in response, f"Missing required field: {field}"

    assert response["status"] in [
        "queued",
        "processing",
        "completed",
        "failed",
    ], f"Invalid status: {response['status']}"

    if response["status"] == "completed":
        assert "video_url" in response, "Completed video should have video_url"
        assert response["video_url"].startswith(
            ("http://", "https://")
        ), "Invalid video URL"

        if "duration" in response:
            assert isinstance(
                response["duration"], (int, float)
            ), "Duration should be numeric"
            assert response["duration"] > 0, "Duration should be positive"


def validate_prompt_enhancement_response(response: Dict[str, Any]) -> None:
    """Validate that a prompt enhancement response has the expected structure."""
    required_fields = ["original_prompt", "enhanced_prompt", "improvements"]

    for field in required_fields:
        assert field in response, f"Missing required field: {field}"

    assert isinstance(
        response["original_prompt"], str
    ), "Original prompt should be a string"
    assert isinstance(
        response["enhanced_prompt"], str
    ), "Enhanced prompt should be a string"
    assert isinstance(response["improvements"], list), "Improvements should be a list"

    assert len(response["enhanced_prompt"]) > len(
        response["original_prompt"]
    ), "Enhanced prompt should be longer"

    for improvement in response["improvements"]:
        assert isinstance(improvement, str), "Each improvement should be a string"


def validate_workflow_execution_response(response: Dict[str, Any]) -> None:
    """Validate that a workflow execution response has the expected structure."""
    required_fields = ["workflow_id", "status", "results", "execution_time"]

    for field in required_fields:
        assert field in response, f"Missing required field: {field}"

    assert response["status"] in [
        "running",
        "completed",
        "failed",
    ], f"Invalid status: {response['status']}"
    assert isinstance(response["results"], dict), "Results should be a dictionary"
    assert isinstance(
        response["execution_time"], (int, float)
    ), "Execution time should be numeric"


def create_mock_firestore_client() -> MagicMock:
    """Create a mock Firestore client for testing."""
    mock_client = MagicMock(spec=firestore.Client)

    # Mock collection and document methods
    mock_collection = MagicMock()
    mock_document = MagicMock()
    mock_doc_ref = MagicMock()

    mock_client.collection.return_value = mock_collection
    mock_collection.document.return_value = mock_document
    mock_document.get.return_value = mock_doc_ref
    mock_doc_ref.exists = True
    mock_doc_ref.to_dict.return_value = {"test": "data"}

    # Mock batch operations
    mock_batch = MagicMock()
    mock_client.batch.return_value = mock_batch
    mock_batch.commit.return_value = []

    return mock_client


def create_mock_storage_client() -> MagicMock:
    """Create a mock Firebase Storage client for testing."""
    mock_bucket = MagicMock()
    mock_blob = MagicMock()

    # Mock bucket and blob operations
    mock_bucket.blob.return_value = mock_blob
    mock_blob.upload_from_filename.return_value = None
    mock_blob.upload_from_string.return_value = None
    mock_blob.generate_signed_url.return_value = (
        "https://storage.googleapis.com/test-bucket/test-file.mp4"
    )
    mock_blob.delete.return_value = None
    mock_blob.exists.return_value = True

    return mock_bucket


def create_mock_openai_client() -> MagicMock:
    """Create a mock OpenAI client for testing."""
    mock_client = MagicMock()

    # Mock chat completions
    mock_completion = MagicMock()
    mock_completion.choices = [MagicMock()]
    mock_completion.choices[0].message.content = "Generated creative content"
    mock_completion.usage.total_tokens = 150

    mock_client.chat.completions.create.return_value = mock_completion

    # Mock streaming completions
    mock_stream_chunk = MagicMock()
    mock_stream_chunk.choices = [MagicMock()]
    mock_stream_chunk.choices[0].delta.content = "streamed content"

    mock_client.chat.completions.create.return_value = [mock_stream_chunk]

    return mock_client


def create_mock_gemini_client() -> MagicMock:
    """Create a mock Google Gemini client for testing."""
    mock_client = MagicMock()
    mock_response = MagicMock()

    mock_response.text = "Generated content from Gemini"
    mock_response.usage_metadata.prompt_token_count = 50
    mock_response.usage_metadata.candidates_token_count = 100

    mock_client.generate_content.return_value = mock_response

    return mock_client


def create_mock_video_provider_client(provider: str) -> MagicMock:
    """Create a mock video generation provider client."""
    mock_client = MagicMock()

    if provider == "runway":
        mock_response = {
            "id": "runway_test_12345",
            "status": "completed",
            "video_url": "https://runway.ml/videos/test.mp4",
            "thumbnail_url": "https://runway.ml/thumbnails/test.jpg",
        }
    elif provider == "pika":
        mock_response = {
            "task_id": "pika_test_67890",
            "state": "finished",
            "result_url": "https://pika.art/videos/test.mp4",
        }
    elif provider == "stability":
        mock_response = {
            "generation_id": "stable_test_abc123",
            "status": "complete",
            "artifacts": [{"url": "https://api.stability.ai/v1/videos/test.mp4"}],
        }
    else:
        mock_response = {"status": "completed", "url": "https://example.com/test.mp4"}

    mock_client.generate.return_value = mock_response
    mock_client.get_status.return_value = mock_response

    return mock_client


async def wait_for_condition(
    condition: Callable[[], bool], timeout: float = 10.0, interval: float = 0.1
) -> bool:
    """Wait for a condition to become true with timeout."""
    start_time = time.time()

    while time.time() - start_time < timeout:
        if condition():
            return True
        await asyncio.sleep(interval)

    return False


def generate_test_data(count: int, template: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate multiple test data items based on a template."""
    items = []

    for i in range(count):
        item = template.copy()
        # Add unique identifiers
        for key, value in item.items():
            if isinstance(value, str) and "{i}" in value:
                item[key] = value.format(i=i)
            elif key == "id" and isinstance(value, str):
                item[key] = f"{value}_{i}"

        items.append(item)

    return items


def assert_json_structure(
    data: Union[str, Dict], expected_structure: Dict[str, type]
) -> None:
    """Assert that JSON data matches the expected structure."""
    if isinstance(data, str):
        data = json.loads(data)

    assert isinstance(data, dict), "Data should be a dictionary"

    for key, expected_type in expected_structure.items():
        assert key in data, f"Missing key: {key}"
        if expected_type is not None:
            assert isinstance(
                data[key], expected_type
            ), f"Key {key} should be {expected_type}, got {type(data[key])}"


def assert_url_valid(url: str) -> None:
    """Assert that a URL is valid."""
    assert isinstance(url, str), "URL should be a string"
    assert url.startswith(
        ("http://", "https://")
    ), "URL should start with http:// or https://"
    assert len(url) > 10, "URL should be longer than 10 characters"


def assert_timestamp_recent(
    timestamp: Union[str, datetime, float], max_age_seconds: float = 300
) -> None:
    """Assert that a timestamp is recent (within max_age_seconds)."""
    if isinstance(timestamp, str):
        # Try to parse ISO format
        try:
            timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        except ValueError:
            pytest.fail(f"Invalid timestamp format: {timestamp}")
    elif isinstance(timestamp, (int, float)):
        timestamp = datetime.fromtimestamp(timestamp)

    now = datetime.now(timestamp.tzinfo) if timestamp.tzinfo else datetime.now()
    age = (now - timestamp).total_seconds()

    assert age <= max_age_seconds, f"Timestamp is too old: {age}s > {max_age_seconds}s"


class MockLogger:
    """Mock logger for testing log output."""

    def __init__(self):
        self.logs = []

    def info(self, message: str, **kwargs):
        self.logs.append({"level": "info", "message": message, "extra": kwargs})

    def debug(self, message: str, **kwargs):
        self.logs.append({"level": "debug", "message": message, "extra": kwargs})

    def warning(self, message: str, **kwargs):
        self.logs.append({"level": "warning", "message": message, "extra": kwargs})

    def error(self, message: str, **kwargs):
        self.logs.append({"level": "error", "message": message, "extra": kwargs})

    def get_logs(self, level: Optional[str] = None) -> List[Dict[str, Any]]:
        if level:
            return [log for log in self.logs if log["level"] == level]
        return self.logs

    def clear_logs(self):
        self.logs.clear()


@asynccontextmanager
async def temporary_environment(env_vars: Dict[str, str]):
    """Temporarily set environment variables for testing."""
    import os

    original_values = {}

    # Store original values and set new ones
    for key, value in env_vars.items():
        original_values[key] = os.environ.get(key)
        os.environ[key] = value

    try:
        yield
    finally:
        # Restore original values
        for key, original_value in original_values.items():
            if original_value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = original_value


def create_test_grpc_context() -> MagicMock:
    """Create a mock gRPC context for testing."""
    context = MagicMock()
    context.peer.return_value = "test-peer"
    context.time_remaining.return_value = 30.0
    context.is_active.return_value = True
    context.add_callback.return_value = None
    context.cancel.return_value = None

    return context


def assert_grpc_error(error, expected_code, expected_message: Optional[str] = None):
    """Assert that a gRPC error has the expected code and message."""
    assert hasattr(error, "code"), "Error should have a code attribute"
    assert (
        error.code() == expected_code
    ), f"Expected code {expected_code}, got {error.code()}"

    if expected_message:
        assert (
            expected_message in error.details()
        ), f"Expected message '{expected_message}' not found in '{error.details()}'"
