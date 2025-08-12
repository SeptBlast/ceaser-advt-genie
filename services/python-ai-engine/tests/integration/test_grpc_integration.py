"""
Integration tests for Python AI Engine gRPC server.
Tests the complete gRPC API endpoints and service integrations.
"""

import pytest
import asyncio
import grpc
from unittest.mock import AsyncMock, patch, MagicMock

from app.grpc_server import AIEngineServicer
from app.services.creative_service import CreativeService
from app.services.video_generation_service import VideoGenerationService
from app.services.prompt_service import PromptService
from app.services.firebase_storage import FirebaseStorage
from app.services.agent_service import AgentService
from tests.fixtures.mock_data import (
    sample_creative_requests,
    sample_video_prompts,
    mock_video_provider_responses,
)
from tests.fixtures.test_utils import (
    create_mock_openai_client,
    create_mock_gemini_client,
    create_mock_storage_client,
    create_test_grpc_context,
    validate_creative_response,
    validate_video_generation_response,
)

# Import protobuf messages
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "proto"))

from proto import ai_engine_pb2 as pb2
from proto import ai_engine_pb2_grpc as pb2_grpc


class TestAIEngineGRPCService:
    """Test suite for AI Engine gRPC service integration."""

    @pytest.fixture
    async def grpc_servicer(self):
        """Create AI Engine servicer with mocked dependencies."""
        with patch("app.services.creative_service.OpenAI") as mock_openai, patch(
            "app.services.creative_service.GenerativeModel"
        ) as mock_gemini, patch(
            "app.services.firebase_storage.storage"
        ) as mock_storage:

            # Setup mocks
            mock_openai.return_value = create_mock_openai_client()
            mock_gemini.return_value = create_mock_gemini_client()
            mock_storage.bucket.return_value = create_mock_storage_client()

            # Create servicer
            servicer = AIEngineServicer()
            return servicer

    @pytest.fixture
    def grpc_context(self):
        """Create mock gRPC context."""
        return create_test_grpc_context()

    @pytest.mark.asyncio
    async def test_generate_text_creative_success(self, grpc_servicer, grpc_context):
        """Test successful text creative generation via gRPC."""
        # Prepare request
        request = pb2.TextGenerationRequest(
            prompt="Create compelling ad copy for a revolutionary fitness app",
            style="energetic",
            brand_guidelines=pb2.BrandGuidelines(
                primary_color="#FF6B35",
                secondary_color="#004E89",
                brand_voice="energetic and motivational",
            ),
            target_audience=pb2.TargetAudience(
                age_range="25-40", interests=["fitness", "health", "technology"]
            ),
        )

        # Execute request
        response = await grpc_servicer.GenerateTextCreative(request, grpc_context)

        # Assertions
        assert response.id
        assert response.content
        assert response.status == "completed"
        assert len(response.content) > 10
        assert response.token_count > 0

    @pytest.mark.asyncio
    async def test_generate_image_creative_success(self, grpc_servicer, grpc_context):
        """Test successful image creative generation via gRPC."""
        # Prepare request
        request = pb2.ImageGenerationRequest(
            prompt="Design a striking image ad for premium coffee subscription service",
            style="minimalist premium",
            aspect_ratio="1:1",
            brand_guidelines=pb2.BrandGuidelines(
                primary_color="#8B4513",
                secondary_color="#F4E4BC",
                brand_voice="sophisticated and premium",
            ),
        )

        # Execute request
        response = await grpc_servicer.GenerateImageCreative(request, grpc_context)

        # Assertions
        assert response.id
        assert response.status == "completed"
        assert response.image_url
        assert response.image_url.startswith(("http://", "https://"))
        assert response.generation_time > 0

    @pytest.mark.asyncio
    async def test_generate_video_creative_success(self, grpc_servicer, grpc_context):
        """Test successful video creative generation via gRPC."""
        # Prepare request
        request = pb2.VideoGenerationRequest(
            prompt="Create an engaging 30-second video ad for sustainable fashion brand",
            duration=30,
            aspect_ratio="16:9",
            style="natural and organic",
            quality="hd",
        )

        # Execute request
        response = await grpc_servicer.GenerateVideoCreative(request, grpc_context)

        # Assertions
        assert response.task_id
        assert response.status in ["queued", "processing", "completed"]
        if response.status == "completed":
            assert response.video_url
            assert response.video_url.startswith(("http://", "https://"))

    @pytest.mark.asyncio
    async def test_enhance_prompt_success(self, grpc_servicer, grpc_context):
        """Test successful prompt enhancement via gRPC."""
        # Prepare request
        request = pb2.PromptEnhancementRequest(
            original_prompt="Create ad for fitness app",
            creative_type="text",
            brand_context="We are a tech startup focused on health and wellness",
        )

        # Execute request
        response = await grpc_servicer.EnhancePrompt(request, grpc_context)

        # Assertions
        assert response.enhanced_prompt
        assert len(response.enhanced_prompt) > len(request.original_prompt)
        assert response.quality_score > 0
        assert len(response.improvements) > 0

    @pytest.mark.asyncio
    async def test_execute_workflow_success(self, grpc_servicer, grpc_context):
        """Test successful workflow execution via gRPC."""
        # Prepare request
        request = pb2.WorkflowExecutionRequest(
            workflow_type="campaign_optimization",
            input_data='{"campaign_id": "camp_123", "optimization_goals": ["increase_ctr"]}',
            configuration='{"analysis_period": "30d", "confidence_threshold": 0.85}',
        )

        # Execute request
        response = await grpc_servicer.ExecuteWorkflow(request, grpc_context)

        # Assertions
        assert response.workflow_id
        assert response.status in ["running", "completed", "failed"]
        assert response.results
        assert response.execution_time >= 0

    @pytest.mark.asyncio
    async def test_get_video_status_success(self, grpc_servicer, grpc_context):
        """Test successful video generation status retrieval via gRPC."""
        # Prepare request
        request = pb2.VideoStatusRequest(task_id="video_task_12345")

        # Execute request
        response = await grpc_servicer.GetVideoStatus(request, grpc_context)

        # Assertions
        assert response.task_id == request.task_id
        assert response.status in ["queued", "processing", "completed", "failed"]
        if response.status == "completed":
            assert response.video_url
        elif response.status == "processing":
            assert 0 <= response.progress <= 100

    @pytest.mark.asyncio
    async def test_analyze_creative_performance(self, grpc_servicer, grpc_context):
        """Test creative performance analysis via gRPC."""
        # Prepare request
        request = pb2.AnalysisRequest(
            analysis_type="creative_performance",
            data='{"creative_id": "creative_123", "metrics": {"ctr": 0.05, "conversions": 100}}',
            timeframe="30d",
        )

        # Execute request
        response = await grpc_servicer.AnalyzeCreativePerformance(request, grpc_context)

        # Assertions
        assert response.analysis
        assert len(response.recommendations) > 0
        assert 0 <= response.confidence_score <= 1
        assert response.analysis_type == request.analysis_type

    @pytest.mark.asyncio
    async def test_grpc_error_handling_invalid_prompt(
        self, grpc_servicer, grpc_context
    ):
        """Test gRPC error handling for invalid prompts."""
        # Prepare request with empty prompt
        request = pb2.TextGenerationRequest(
            prompt="", style="energetic"  # Empty prompt should trigger validation error
        )

        # Execute request and expect error
        with pytest.raises(grpc.RpcError) as exc_info:
            await grpc_servicer.GenerateTextCreative(request, grpc_context)

        error = exc_info.value
        assert error.code() == grpc.StatusCode.INVALID_ARGUMENT
        assert "prompt" in error.details().lower()

    @pytest.mark.asyncio
    async def test_grpc_error_handling_service_unavailable(
        self, grpc_servicer, grpc_context
    ):
        """Test gRPC error handling when AI service is unavailable."""
        # Mock OpenAI to raise an exception
        with patch("app.services.creative_service.OpenAI") as mock_openai:
            mock_openai.side_effect = Exception("Service unavailable")

            request = pb2.TextGenerationRequest(
                prompt="Create ad copy", style="friendly"
            )

            # Execute request and expect error
            with pytest.raises(grpc.RpcError) as exc_info:
                await grpc_servicer.GenerateTextCreative(request, grpc_context)

            error = exc_info.value
            assert error.code() == grpc.StatusCode.UNAVAILABLE

    @pytest.mark.asyncio
    async def test_grpc_timeout_handling(self, grpc_servicer, grpc_context):
        """Test gRPC timeout handling for long-running operations."""
        # Mock context to simulate timeout
        grpc_context.time_remaining.return_value = 0.1  # Very short timeout

        # Mock video service to take longer than timeout
        with patch(
            "app.services.video_generation_service.VideoGenerationService.generate_video"
        ) as mock_generate:

            async def slow_generate(*args, **kwargs):
                await asyncio.sleep(1)  # Longer than timeout
                return {"task_id": "test", "status": "completed"}

            mock_generate.side_effect = slow_generate

            request = pb2.VideoGenerationRequest(prompt="Create video", duration=30)

            # Execute request and expect timeout
            with pytest.raises(grpc.RpcError) as exc_info:
                await grpc_servicer.GenerateVideoCreative(request, grpc_context)

            error = exc_info.value
            assert error.code() == grpc.StatusCode.DEADLINE_EXCEEDED

    @pytest.mark.asyncio
    async def test_concurrent_requests(self, grpc_servicer, grpc_context):
        """Test handling multiple concurrent gRPC requests."""
        # Prepare multiple requests
        requests = [
            pb2.TextGenerationRequest(prompt=f"Create ad copy #{i}", style="friendly")
            for i in range(5)
        ]

        # Execute requests concurrently
        tasks = [
            grpc_servicer.GenerateTextCreative(req, grpc_context) for req in requests
        ]

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        # Assertions
        assert len(responses) == 5
        for response in responses:
            if isinstance(response, Exception):
                pytest.fail(f"Request failed with exception: {response}")
            else:
                assert response.id
                assert response.content
                assert response.status == "completed"

    @pytest.mark.asyncio
    async def test_streaming_text_generation(self, grpc_servicer, grpc_context):
        """Test streaming text generation via gRPC."""
        # Prepare request
        request = pb2.TextGenerationRequest(
            prompt="Create a long advertisement copy", style="detailed", stream=True
        )

        # Execute streaming request
        response_stream = grpc_servicer.GenerateTextCreativeStream(
            request, grpc_context
        )

        chunks = []
        async for chunk in response_stream:
            chunks.append(chunk)

        # Assertions
        assert len(chunks) > 1  # Should receive multiple chunks
        assert all(chunk.content for chunk in chunks)  # Each chunk should have content
        assert chunks[-1].is_final  # Last chunk should be marked as final

    @pytest.mark.asyncio
    async def test_batch_creative_generation(self, grpc_servicer, grpc_context):
        """Test batch creative generation via gRPC."""
        # Prepare batch request
        request = pb2.BatchCreativeRequest(
            requests=[
                pb2.TextGenerationRequest(prompt="Create ad copy 1", style="friendly"),
                pb2.TextGenerationRequest(
                    prompt="Create ad copy 2", style="professional"
                ),
                pb2.ImageGenerationRequest(prompt="Create image ad", style="modern"),
            ]
        )

        # Execute batch request
        response = await grpc_servicer.GenerateBatchCreatives(request, grpc_context)

        # Assertions
        assert len(response.results) == len(request.requests)
        for result in response.results:
            assert result.id
            assert result.status in ["completed", "failed"]

    @pytest.mark.asyncio
    async def test_health_check(self, grpc_servicer, grpc_context):
        """Test health check endpoint."""
        # Prepare request
        request = pb2.HealthCheckRequest()

        # Execute request
        response = await grpc_servicer.HealthCheck(request, grpc_context)

        # Assertions
        assert response.status == "healthy"
        assert response.timestamp
        assert len(response.services) > 0
        for service in response.services:
            assert service.name
            assert service.status in ["healthy", "unhealthy"]


class TestGRPCPerformance:
    """Performance tests for gRPC service."""

    @pytest.mark.asyncio
    async def test_text_generation_performance(self, grpc_servicer, grpc_context):
        """Test text generation performance benchmark."""
        request = pb2.TextGenerationRequest(
            prompt="Create compelling ad copy", style="friendly"
        )

        # Measure execution time
        start_time = asyncio.get_event_loop().time()
        response = await grpc_servicer.GenerateTextCreative(request, grpc_context)
        end_time = asyncio.get_event_loop().time()

        # Performance assertions
        execution_time = end_time - start_time
        assert execution_time < 10.0  # Should complete within 10 seconds
        assert response.status == "completed"

    @pytest.mark.asyncio
    async def test_concurrent_load(self, grpc_servicer, grpc_context):
        """Test performance under concurrent load."""
        # Create multiple concurrent requests
        num_requests = 10
        requests = [
            pb2.TextGenerationRequest(prompt=f"Create ad copy #{i}", style="friendly")
            for i in range(num_requests)
        ]

        # Measure concurrent execution time
        start_time = asyncio.get_event_loop().time()
        tasks = [
            grpc_servicer.GenerateTextCreative(req, grpc_context) for req in requests
        ]
        responses = await asyncio.gather(*tasks)
        end_time = asyncio.get_event_loop().time()

        # Performance assertions
        total_time = end_time - start_time
        assert total_time < 30.0  # All requests should complete within 30 seconds
        assert len(responses) == num_requests
        assert all(r.status == "completed" for r in responses)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])
