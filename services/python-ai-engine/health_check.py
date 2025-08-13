#!/usr/bin/env python3
"""
Health check and diagnostics for Python AI Engine Docker container.
Run this to check what's failing during startup.
"""

import os
import sys
import logging
import asyncio
from typing import Dict, List

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_environment_variables() -> Dict[str, bool]:
    """Check required environment variables."""
    required_vars = [
        'GRPC_PORT',
        'FIREBASE_PROJECT_ID',
        'GOOGLE_APPLICATION_CREDENTIALS'
    ]
    
    optional_vars = [
        'OPENAI_API_KEY',
        'GOOGLE_API_KEY',
        'REDIS_URL'
    ]
    
    results = {}
    
    logger.info("Checking environment variables...")
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            logger.info(f"✅ {var}: {value[:20]}..." if len(value) > 20 else f"✅ {var}: {value}")
            results[var] = True
        else:
            logger.error(f"❌ {var}: NOT SET (REQUIRED)")
            results[var] = False
    
    for var in optional_vars:
        value = os.getenv(var)
        if value:
            logger.info(f"✅ {var}: {value[:20]}..." if len(value) > 20 else f"✅ {var}: {value}")
            results[var] = True
        else:
            logger.warning(f"⚠️  {var}: NOT SET (OPTIONAL)")
            results[var] = False
    
    return results

def check_file_permissions() -> Dict[str, bool]:
    """Check file and directory permissions."""
    paths_to_check = [
        '/app',
        '/app/main.py',
        '/app/app',
        '/app/firebase',
        '/app/firebase/service-account.json'
    ]
    
    results = {}
    
    logger.info("Checking file permissions...")
    
    for path in paths_to_check:
        try:
            if os.path.exists(path):
                if os.path.isdir(path):
                    if os.access(path, os.R_OK | os.X_OK):
                        logger.info(f"✅ Directory {path}: accessible")
                        results[path] = True
                    else:
                        logger.error(f"❌ Directory {path}: permission denied")
                        results[path] = False
                else:
                    if os.access(path, os.R_OK):
                        logger.info(f"✅ File {path}: readable")
                        results[path] = True
                    else:
                        logger.error(f"❌ File {path}: permission denied")
                        results[path] = False
            else:
                logger.error(f"❌ {path}: does not exist")
                results[path] = False
        except Exception as e:
            logger.error(f"❌ {path}: error checking - {e}")
            results[path] = False
    
    return results

def check_python_imports() -> Dict[str, bool]:
    """Check if all required Python packages can be imported."""
    required_packages = [
        'grpc',
        'structlog',
        'langchain',
        'langchain_openai',
        'langchain_google_genai',
        'firebase_admin',
        'google.cloud.firestore',
        'redis',
        'opentelemetry',
        'qdrant_client'
    ]
    
    results = {}
    
    logger.info("Checking Python package imports...")
    
    for package in required_packages:
        try:
            __import__(package.replace('.', '_').replace('-', '_'))
            logger.info(f"✅ {package}: imported successfully")
            results[package] = True
        except ImportError as e:
            logger.error(f"❌ {package}: import failed - {e}")
            results[package] = False
        except Exception as e:
            logger.error(f"❌ {package}: unexpected error - {e}")
            results[package] = False
    
    return results

def check_service_initialization() -> Dict[str, bool]:
    """Try to initialize each service to see what fails."""
    results = {}
    
    logger.info("Checking service initialization...")
    
    # Check app.services imports
    try:
        from app.services.creative_service import CreativeService
        logger.info("✅ CreativeService: import successful")
        
        # Try to initialize
        service = CreativeService()
        logger.info("✅ CreativeService: initialization successful")
        results['CreativeService'] = True
    except Exception as e:
        logger.error(f"❌ CreativeService: failed - {e}")
        results['CreativeService'] = False
    
    try:
        from app.services.analysis_service import AnalysisService
        logger.info("✅ AnalysisService: import successful")
        
        service = AnalysisService()
        logger.info("✅ AnalysisService: initialization successful")
        results['AnalysisService'] = True
    except Exception as e:
        logger.error(f"❌ AnalysisService: failed - {e}")
        results['AnalysisService'] = False
    
    try:
        from app.services.agent_service import AgentService
        logger.info("✅ AgentService: import successful")
        
        service = AgentService()
        logger.info("✅ AgentService: initialization successful")
        results['AgentService'] = True
    except Exception as e:
        logger.error(f"❌ AgentService: failed - {e}")
        results['AgentService'] = False
    
    try:
        from app.services.insights_service import InsightsService
        logger.info("✅ InsightsService: import successful")
        
        service = InsightsService()
        logger.info("✅ InsightsService: initialization successful")
        results['InsightsService'] = True
    except Exception as e:
        logger.error(f"❌ InsightsService: failed - {e}")
        results['InsightsService'] = False
    
    return results

async def check_grpc_server() -> bool:
    """Try to start a basic gRPC server."""
    try:
        import grpc
        from concurrent import futures
        
        logger.info("Testing gRPC server startup...")
        
        server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=2))
        port = os.getenv('GRPC_PORT', '50051')
        listen_addr = f"[::]:{port}"
        
        server.add_insecure_port(listen_addr)
        logger.info(f"✅ gRPC server: port binding successful on {listen_addr}")
        
        await server.start()
        logger.info("✅ gRPC server: startup successful")
        
        await server.stop(1)
        logger.info("✅ gRPC server: shutdown successful")
        
        return True
    except Exception as e:
        logger.error(f"❌ gRPC server: failed - {e}")
        return False

def check_firebase_connection() -> bool:
    """Check Firebase connection."""
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        
        logger.info("Testing Firebase connection...")
        
        # Check if service account file exists
        cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if not cred_path or not os.path.exists(cred_path):
            logger.error(f"❌ Firebase: service account file not found at {cred_path}")
            return False
        
        # Try to initialize Firebase (if not already initialized)
        try:
            cred = credentials.Certificate(cred_path)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            logger.info("✅ Firebase: credentials loaded successfully")
        except ValueError:
            # App already initialized
            logger.info("✅ Firebase: already initialized")
        
        # Try to connect to Firestore
        db = firestore.client()
        logger.info("✅ Firebase: Firestore client created successfully")
        
        return True
    except Exception as e:
        logger.error(f"❌ Firebase: connection failed - {e}")
        return False

async def main():
    """Run all health checks."""
    logger.info("🔍 Starting Python AI Engine Health Check...")
    logger.info("=" * 60)
    
    all_passed = True
    
    # Environment variables
    env_results = check_environment_variables()
    if not all(env_results.values()):
        all_passed = False
    
    logger.info("=" * 60)
    
    # File permissions
    file_results = check_file_permissions()
    if not all(file_results.values()):
        all_passed = False
    
    logger.info("=" * 60)
    
    # Python imports
    import_results = check_python_imports()
    if not all(import_results.values()):
        all_passed = False
    
    logger.info("=" * 60)
    
    # Service initialization
    service_results = check_service_initialization()
    if not all(service_results.values()):
        all_passed = False
    
    logger.info("=" * 60)
    
    # Firebase connection
    firebase_ok = check_firebase_connection()
    if not firebase_ok:
        all_passed = False
    
    logger.info("=" * 60)
    
    # gRPC server
    grpc_ok = await check_grpc_server()
    if not grpc_ok:
        all_passed = False
    
    logger.info("=" * 60)
    
    if all_passed:
        logger.info("🎉 All health checks passed! Python AI Engine should start successfully.")
        return 0
    else:
        logger.error("❌ Some health checks failed. Fix the issues above before starting the service.")
        return 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
