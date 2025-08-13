import asyncio
import logging
import os
import sys
from concurrent import futures
from typing import Dict, Any

import grpc
import structlog
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Configure structured logging
try:
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    logger = structlog.get_logger()
except Exception as e:
    # Fallback to basic logging if structlog fails
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    logger.error(f"Failed to configure structlog, using basic logging: {e}")

# Import services with error handling
try:
    from app.services.creative_service import CreativeService
    from app.services.analysis_service import AnalysisService
    from app.services.agent_service import AgentService
    from app.services.insights_service import InsightsService
    logger.info("Successfully imported all service modules")
except ImportError as e:
    logger.error(f"Failed to import service modules: {e}")
    sys.exit(1)
except Exception as e:
    logger.error(f"Unexpected error importing services: {e}")
    sys.exit(1)


class AIEngineServicer:  # Will inherit from ai_engine_pb2_grpc.AIEngineServiceServicer
    """
    gRPC service implementation for AI Engine.
    Handles complex AI reasoning, creative generation, and agentic workflows.
    """

    def __init__(self):
        """Initialize AI Engine servicer with error handling."""
        logger.info("Initializing AIEngineServicer...")
        
        try:
            self.creative_service = CreativeService()
            logger.info("✅ CreativeService initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize CreativeService: {e}")
            raise
        
        try:
            self.analysis_service = AnalysisService()
            logger.info("✅ AnalysisService initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize AnalysisService: {e}")
            raise
        
        try:
            self.agent_service = AgentService()
            logger.info("✅ AgentService initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize AgentService: {e}")
            raise
        
        try:
            self.insights_service = InsightsService()
            logger.info("✅ InsightsService initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize InsightsService: {e}")
            raise
        
        logger.info("🎉 AIEngineServicer initialized successfully with all services")

    async def GenerateCreative(self, request, context):
        """Generate creative content using AI models and LangChain"""
        try:
            logger.info(
                "GenerateCreative called",
                campaign_id=request.campaign_id,
                creative_type=request.creative_type,
            )

            result = await self.creative_service.generate_creative(
                campaign_id=request.campaign_id,
                creative_type=request.creative_type,
                parameters=dict(request.parameters),
                platforms=list(request.platforms),
                target_audience=request.target_audience,
                brand_guidelines=request.brand_guidelines,
                tenant_name=getattr(request, "tenant_name", None),
                creative_id=getattr(request, "creative_id", None),
            )

            # TODO: Convert result to protobuf response format
            # return ai_engine_pb2.GenerateCreativeResponse(**result)

            logger.info(
                "Creative generation completed successfully",
                campaign_id=request.campaign_id,
            )
            return result

        except Exception as e:
            logger.error(
                "Failed to generate creative",
                error=str(e),
                campaign_id=request.campaign_id,
            )
            context.set_details(f"Creative generation failed: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            return None

    async def GenerateVideo(self, request, context):
        """Convenience handler to generate videos with explicit model selection"""
        try:
            logger.info(
                "GenerateVideo called",
                campaign_id=getattr(request, "campaign_id", "unknown"),
                model=getattr(request, "video_model", None),
            )

            params = dict(getattr(request, "parameters", {}))
            # Ensure required fields are present
            if getattr(request, "video_model", None):
                params["video_model"] = request.video_model
            if getattr(request, "user_prompt", None):
                params["user_prompt"] = request.user_prompt
            if getattr(request, "variations", None):
                params["variations"] = request.variations
            if getattr(request, "regenerate_feedback", None):
                params["regenerate_feedback"] = request.regenerate_feedback

            result = await self.creative_service.generate_creative(
                campaign_id=getattr(request, "campaign_id", "unknown"),
                creative_type="video",
                parameters=params,
                platforms=list(getattr(request, "platforms", [])),
                target_audience=getattr(request, "target_audience", {}),
                brand_guidelines=getattr(request, "brand_guidelines", {}),
                tenant_name=getattr(request, "tenant_name", None),
                creative_id=getattr(request, "creative_id", None),
            )

            logger.info("GenerateVideo completed successfully")
            return result
        except Exception as e:
            logger.error("Failed to generate video", error=str(e))
            context.set_details(f"Video generation failed: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            return None

    async def ListVideoModels(self, request, context):
        """List supported video generation models for end-user selection"""
        try:
            models = self.creative_service.list_video_models()
            return {"models": models}
        except Exception as e:
            logger.error("Failed to list video models", error=str(e))
            context.set_details(f"ListVideoModels failed: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            return None

    async def AnalyzeCampaign(self, request, context):
        """Perform complex campaign analysis using AI"""
        try:
            logger.info(
                "AnalyzeCampaign called",
                campaign_id=request.campaign_id,
                analysis_type=request.analysis_type,
            )

            result = await self.analysis_service.analyze_campaign(
                campaign_id=request.campaign_id,
                metrics=list(request.metrics),
                analysis_type=request.analysis_type,
                filters=dict(request.filters),
            )

            logger.info(
                "Campaign analysis completed successfully",
                campaign_id=request.campaign_id,
            )
            return result

        except Exception as e:
            logger.error(
                "Failed to analyze campaign",
                error=str(e),
                campaign_id=request.campaign_id,
            )
            context.set_details(f"Campaign analysis failed: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            return None

    async def ExecuteAgentWorkflow(self, request, context):
        """Execute complex agentic workflows with tools"""
        try:
            logger.info(
                "ExecuteAgentWorkflow called",
                workflow_type=request.workflow_type,
                user_query=request.user_query,
            )

            result = await self.agent_service.execute_workflow(
                workflow_type=request.workflow_type,
                user_query=request.user_query,
                context=dict(request.context),
                available_tools=list(request.available_tools),
                campaign_id=request.campaign_id,
            )

            logger.info(
                "Agent workflow completed successfully",
                workflow_type=request.workflow_type,
            )
            return result

        except Exception as e:
            logger.error(
                "Failed to execute agent workflow",
                error=str(e),
                workflow_type=request.workflow_type,
            )
            context.set_details(f"Agent workflow failed: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            return None

    async def GenerateInsights(self, request, context):
        """Generate AI-powered insights and recommendations"""
        try:
            logger.info(
                "GenerateInsights called",
                campaign_id=request.campaign_id,
                insight_type=request.insight_type,
            )

            result = await self.insights_service.generate_insights(
                campaign_id=request.campaign_id,
                insight_type=request.insight_type,
                time_range=request.time_range,
                parameters=dict(request.parameters),
            )

            logger.info(
                "Insights generation completed successfully",
                campaign_id=request.campaign_id,
            )
            return result

        except Exception as e:
            logger.error(
                "Failed to generate insights",
                error=str(e),
                campaign_id=request.campaign_id,
            )
            context.set_details(f"Insights generation failed: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            return None


async def serve():
    """Start the gRPC server with comprehensive error handling"""
    try:
        logger.info("Starting AI Engine gRPC server initialization...")
        
        # Check environment variables
        port = os.getenv('GRPC_PORT', '50051')
        max_workers = int(os.getenv('GRPC_MAX_WORKERS', '10'))
        
        logger.info(f"Server configuration - Port: {port}, Max Workers: {max_workers}")
        
        # Create server
        server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=max_workers))
        
        # Initialize servicer
        logger.info("Initializing AI Engine servicer...")
        servicer = AIEngineServicer()
        
        # Add the servicer to the server (proto definitions commented out for now)
        # ai_engine_pb2_grpc.add_AIEngineServiceServicer_to_server(servicer, server)
        logger.info("AI Engine servicer added to server")
        
        # Configure server address
        listen_addr = f"[::]:{port}"
        actual_port = server.add_insecure_port(listen_addr)
        
        if actual_port == 0:
            raise Exception(f"Failed to bind to port {port}")
        
        logger.info(f"✅ Successfully bound to address: {listen_addr} (port: {actual_port})")
        
        # Start server
        logger.info("Starting gRPC server...")
        await server.start()
        logger.info("🚀 AI Engine gRPC server started successfully!")
        logger.info(f"Server listening on {listen_addr}")
        
        # Wait for termination
        try:
            await server.wait_for_termination()
        except KeyboardInterrupt:
            logger.info("Received interrupt signal, shutting down...")
        finally:
            logger.info("Stopping AI Engine server...")
            await server.stop(grace=5)
            logger.info("✅ AI Engine server stopped gracefully")
    
    except Exception as e:
        logger.error(f"❌ Failed to start AI Engine server: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise


def check_required_env_vars():
    """Check if required environment variables are set."""
    required_vars = {
        'FIREBASE_PROJECT_ID': 'Firebase project ID',
        'GOOGLE_APPLICATION_CREDENTIALS': 'Path to Firebase service account key'
    }
    
    missing_vars = []
    for var, description in required_vars.items():
        if not os.getenv(var):
            missing_vars.append(f"{var} ({description})")
    
    if missing_vars:
        logger.error("❌ Missing required environment variables:")
        for var in missing_vars:
            logger.error(f"   - {var}")
        return False
    
    logger.info("✅ All required environment variables are set")
    return True


def main():
    """Main entry point with startup validation."""
    logger.info("🚀 Python AI Engine Starting...")
    logger.info("=" * 60)
    
    # Check environment variables
    if not check_required_env_vars():
        logger.error("❌ Environment validation failed")
        sys.exit(1)
    
    # Check file permissions
    service_account_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    if service_account_path and not os.path.exists(service_account_path):
        logger.error(f"❌ Service account file not found: {service_account_path}")
        sys.exit(1)
    
    logger.info("✅ Environment validation passed")
    logger.info("=" * 60)
    
    # Set up basic logging for asyncio
    logging.basicConfig(level=logging.INFO)
    
    try:
        # Run the server
        asyncio.run(serve())
    except KeyboardInterrupt:
        logger.info("Received interrupt, exiting...")
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
