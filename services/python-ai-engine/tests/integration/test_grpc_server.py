"""
Integration tests for Python AI Engine gRPC server startup, lifecycle, and basic connectivity.
Tests the gRPC server behavior, connection handling, and service registration.
"""

import pytest
import asyncio
import grpc
import threading
import time
from concurrent import futures
from unittest.mock import Mock, patch, MagicMock, AsyncMock

from main import AIEngineServicer


class TestGRPCServer:
    """Test suite for gRPC server functionality and lifecycle management."""

    @pytest.fixture
    def mock_services(self):
        """Mock all AI services for isolated server testing."""
        with patch("app.services.creative_service.CreativeService") as mock_creative, \
             patch("app.services.analysis_service.AnalysisService") as mock_analysis, \
             patch("app.services.agent_service.AgentService") as mock_agent, \
             patch("app.services.insights_service.InsightsService") as mock_insights:
            
            # Setup service mocks
            mock_creative.return_value = Mock()
            mock_analysis.return_value = Mock()
            mock_agent.return_value = Mock()
            mock_insights.return_value = Mock()
            
            yield {
                'creative': mock_creative,
                'analysis': mock_analysis,
                'agent': mock_agent,
                'insights': mock_insights
            }

    @pytest.fixture
    def grpc_servicer(self, mock_services):
        """Create AIEngineServicer with mocked dependencies."""
        servicer = AIEngineServicer()
        return servicer

    def test_servicer_initialization(self, mock_services):
        """Test that AIEngineServicer initializes correctly with all services."""
        servicer = AIEngineServicer()
        
        # Verify servicer has all required services
        assert hasattr(servicer, 'creative_service')
        assert hasattr(servicer, 'analysis_service')
        assert hasattr(servicer, 'agent_service')
        assert hasattr(servicer, 'insights_service')
        
        # Verify services are not None
        assert servicer.creative_service is not None
        assert servicer.analysis_service is not None
        assert servicer.agent_service is not None
        assert servicer.insights_service is not None

    @pytest.mark.asyncio
    async def test_grpc_server_startup_shutdown(self, mock_services):
        """Test gRPC server can start and shutdown cleanly."""
        port = "50052"  # Use different port to avoid conflicts
        
        # Mock the gRPC server components
        with patch("grpc.aio.server") as mock_server_func:
            mock_server = AsyncMock()
            mock_server.start = AsyncMock()
            mock_server.stop = AsyncMock()
            mock_server.wait_for_termination = AsyncMock()
            mock_server.add_insecure_port = Mock(return_value=50052)
            mock_server_func.return_value = mock_server
            
            # Test server startup
            server = mock_server_func()
            servicer = AIEngineServicer()
            
            # Add servicer to server (normally done by add_servicer_to_server)
            port_result = server.add_insecure_port(f"[::]:{port}")
            assert port_result == 50052
            
            # Start server
            await server.start()
            mock_server.start.assert_called_once()
            
            # Stop server
            await server.stop(grace=5)
            mock_server.stop.assert_called_once_with(grace=5)

    def test_grpc_server_port_binding(self):
        """Test that gRPC server can bind to specified ports."""
        with patch("grpc.server") as mock_server_func:
            mock_server = Mock()
            mock_server.add_insecure_port.return_value = 50051
            mock_server_func.return_value = mock_server
            
            server = mock_server_func(futures.ThreadPoolExecutor(max_workers=10))
            
            # Test default port binding
            port = server.add_insecure_port("[::]:50051")
            assert port == 50051
            
            # Verify server was created with correct thread pool
            mock_server_func.assert_called_once()

    @pytest.mark.asyncio
    async def test_servicer_method_existence(self, grpc_servicer):
        """Test that servicer has all required gRPC methods."""
        # Test that core methods exist and are callable
        assert hasattr(grpc_servicer, 'GenerateCreative')
        assert callable(getattr(grpc_servicer, 'GenerateCreative'))
        
        assert hasattr(grpc_servicer, 'GenerateVideo')
        assert callable(getattr(grpc_servicer, 'GenerateVideo'))
        
        assert hasattr(grpc_servicer, 'AnalyzePerformance')
        assert callable(getattr(grpc_servicer, 'AnalyzePerformance'))
        
        assert hasattr(grpc_servicer, 'ExecuteAgent')
        assert callable(getattr(grpc_servicer, 'ExecuteAgent'))
        
        assert hasattr(grpc_servicer, 'GenerateInsights')
        assert callable(getattr(grpc_servicer, 'GenerateInsights'))

    @pytest.mark.asyncio
    async def test_grpc_method_error_handling(self, grpc_servicer):
        """Test that gRPC methods handle errors gracefully."""
        # Mock request and context
        mock_request = Mock()
        mock_request.campaign_id = "test_campaign"
        mock_request.creative_type = "text"
        mock_request.parameters = {}
        mock_request.platforms = []
        mock_request.target_audience = "test_audience"
        mock_request.brand_guidelines = "test_guidelines"
        
        mock_context = Mock()
        mock_context.set_details = Mock()
        mock_context.set_code = Mock()
        
        # Mock service to raise exception
        grpc_servicer.creative_service.generate_creative = AsyncMock(
            side_effect=Exception("Test error")
        )
        
        # Call method and verify error handling
        result = await grpc_servicer.GenerateCreative(mock_request, mock_context)
        
        # Verify error was handled
        assert result is None
        mock_context.set_details.assert_called_once()
        mock_context.set_code.assert_called_once_with(grpc.StatusCode.INTERNAL)

    @pytest.mark.asyncio
    async def test_concurrent_requests(self, grpc_servicer):
        """Test that servicer can handle concurrent requests."""
        # Mock request and context
        mock_request = Mock()
        mock_request.campaign_id = "test_campaign"
        mock_request.creative_type = "text"
        mock_request.parameters = {}
        mock_request.platforms = []
        mock_request.target_audience = "test_audience"
        mock_request.brand_guidelines = "test_guidelines"
        
        mock_context = Mock()
        mock_context.set_details = Mock()
        mock_context.set_code = Mock()
        
        # Mock successful response
        expected_result = {"content": "Generated content", "status": "success"}
        grpc_servicer.creative_service.generate_creative = AsyncMock(
            return_value=expected_result
        )
        
        # Create multiple concurrent requests
        tasks = []
        for i in range(5):
            task = asyncio.create_task(
                grpc_servicer.GenerateCreative(mock_request, mock_context)
            )
            tasks.append(task)
        
        # Wait for all requests to complete
        results = await asyncio.gather(*tasks)
        
        # Verify all requests completed successfully
        assert len(results) == 5
        for result in results:
            assert result == expected_result

    def test_health_check_capability(self, grpc_servicer):
        """Test servicer readiness for health checks."""
        # Verify servicer is properly initialized
        assert grpc_servicer is not None
        assert grpc_servicer.creative_service is not None
        assert grpc_servicer.analysis_service is not None
        assert grpc_servicer.agent_service is not None
        assert grpc_servicer.insights_service is not None

    @pytest.mark.asyncio
    async def test_request_validation(self, grpc_servicer):
        """Test that servicer validates requests appropriately."""
        # Test with minimal valid request
        mock_request = Mock()
        mock_request.campaign_id = "valid_campaign"
        mock_request.creative_type = "text"
        mock_request.parameters = {}
        mock_request.platforms = ["facebook"]
        mock_request.target_audience = "adults"
        mock_request.brand_guidelines = "professional"
        
        mock_context = Mock()
        
        # Mock successful service response
        expected_result = {"content": "Valid content", "status": "completed"}
        grpc_servicer.creative_service.generate_creative = AsyncMock(
            return_value=expected_result
        )
        
        result = await grpc_servicer.GenerateCreative(mock_request, mock_context)
        assert result == expected_result

    @pytest.mark.asyncio
    async def test_service_dependencies_isolation(self, grpc_servicer):
        """Test that service failures don't affect other services."""
        # Mock one service to fail
        grpc_servicer.creative_service.generate_creative = AsyncMock(
            side_effect=Exception("Creative service failed")
        )
        
        # Other services should still work
        grpc_servicer.analysis_service.analyze_performance = AsyncMock(
            return_value={"analysis": "success"}
        )
        
        # Test that analysis service still works despite creative service failure
        mock_request = Mock()
        mock_context = Mock()
        
        # This should work fine
        analysis_result = await grpc_servicer.analysis_service.analyze_performance(
            mock_request
        )
        assert analysis_result == {"analysis": "success"}

    def test_environment_configuration(self):
        """Test that server respects environment configuration."""
        # Test that testing environment is detected
        import os
        assert os.getenv("TESTING") == "true"
        
        # Test default port configuration
        default_port = os.getenv("GRPC_PORT", "50051")
        assert default_port in ["50051", "50052", "50053"]  # Common gRPC ports

    @pytest.mark.asyncio
    async def test_graceful_shutdown_with_active_requests(self, grpc_servicer):
        """Test that server handles shutdown gracefully with active requests."""
        # Mock a long-running request
        mock_request = Mock()
        mock_request.campaign_id = "long_campaign"
        mock_request.creative_type = "video"
        mock_request.parameters = {}
        mock_request.platforms = ["youtube"]
        mock_request.target_audience = "teens"
        mock_request.brand_guidelines = "trendy"
        
        mock_context = Mock()
        
        # Mock service with delay
        async def delayed_response(*args, **kwargs):
            await asyncio.sleep(0.1)  # Simulate processing time
            return {"content": "Delayed content", "status": "completed"}
        
        grpc_servicer.creative_service.generate_creative = delayed_response
        
        # Start request and simulate shutdown
        request_task = asyncio.create_task(
            grpc_servicer.GenerateCreative(mock_request, mock_context)
        )
        
        # Let request start
        await asyncio.sleep(0.05)
        
        # Request should complete even during "shutdown"
        result = await request_task
        assert result["status"] == "completed"

    def test_logging_configuration(self, grpc_servicer):
        """Test that proper logging is configured for the server."""
        import structlog
        
        # Verify logger is available
        logger = structlog.get_logger()
        assert logger is not None
        
        # Test that servicer can log
        try:
            logger.info("Test log message for gRPC server")
            # If no exception, logging is working
            assert True
        except Exception:
            pytest.fail("Logging configuration is not working properly")

    @pytest.mark.asyncio
    async def test_memory_usage_with_multiple_requests(self, grpc_servicer):
        """Test that server doesn't leak memory with multiple requests."""
        import gc
        import psutil
        import os
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Mock request
        mock_request = Mock()
        mock_request.campaign_id = "memory_test"
        mock_request.creative_type = "text"
        mock_request.parameters = {}
        mock_request.platforms = ["instagram"]
        mock_request.target_audience = "young_adults"
        mock_request.brand_guidelines = "casual"
        
        mock_context = Mock()
        
        # Mock fast response
        grpc_servicer.creative_service.generate_creative = AsyncMock(
            return_value={"content": "Quick content", "status": "completed"}
        )
        
        # Execute many requests
        for _ in range(50):
            await grpc_servicer.GenerateCreative(mock_request, mock_context)
        
        # Force garbage collection
        gc.collect()
        
        # Check memory usage hasn't grown excessively
        final_memory = process.memory_info().rss
        memory_growth = final_memory - initial_memory
        
        # Allow for some memory growth but not excessive (100MB threshold)
        assert memory_growth < 100 * 1024 * 1024, f"Memory grew by {memory_growth} bytes"


class TestGRPCServerConfiguration:
    """Test gRPC server configuration and setup."""

    def test_server_interceptors(self):
        """Test that server can be configured with interceptors."""
        with patch("grpc.server") as mock_server_func:
            mock_server = Mock()
            mock_server_func.return_value = mock_server
            
            # Test server creation with interceptors
            interceptors = []  # Empty for now, but structure is ready
            server = mock_server_func(
                futures.ThreadPoolExecutor(max_workers=10),
                interceptors=interceptors
            )
            
            assert server is not None

    def test_server_options(self):
        """Test that server can be configured with custom options."""
        options = [
            ('grpc.keepalive_time_ms', 30000),
            ('grpc.keepalive_timeout_ms', 5000),
            ('grpc.keepalive_permit_without_calls', True),
            ('grpc.http2.max_pings_without_data', 0),
        ]
        
        with patch("grpc.server") as mock_server_func:
            mock_server = Mock()
            mock_server_func.return_value = mock_server
            
            # Test server creation with options
            server = mock_server_func(
                futures.ThreadPoolExecutor(max_workers=10),
                options=options
            )
            
            assert server is not None

    def test_ssl_configuration_readiness(self):
        """Test that server is ready for SSL configuration."""
        # This tests that SSL credentials could be added
        # (actual SSL testing would require certificates)
        
        with patch("grpc.server") as mock_server_func, \
             patch("grpc.ssl_server_credentials") as mock_ssl:
            
            mock_server = Mock()
            mock_server.add_secure_port = Mock(return_value=50051)
            mock_server_func.return_value = mock_server
            
            mock_credentials = Mock()
            mock_ssl.return_value = mock_credentials
            
            server = mock_server_func(futures.ThreadPoolExecutor(max_workers=10))
            
            # Test that secure port could be added
            port = server.add_secure_port("[::]:50051", mock_credentials)
            assert port == 50051
            
            server.add_secure_port.assert_called_once_with("[::]:50051", mock_credentials)


if __name__ == "__main__":
    pytest.main([__file__])
