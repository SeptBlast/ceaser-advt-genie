"""
Test fixtures and mock data for Python AI Engine tests.
Contains sample data structures, mock responses, and test utilities.
"""

import os
import tempfile
from datetime import datetime, timedelta
from typing import Dict, Any, List


# Sample creative requests
def sample_creative_requests() -> Dict[str, Dict[str, Any]]:
    """Return sample creative generation requests for different types."""
    return {
        "text_ad": {
            "prompt": "Create compelling ad copy for a revolutionary fitness app",
            "type": "text",
            "brand_guidelines": {
                "primary_color": "#FF6B35",
                "secondary_color": "#004E89",
                "brand_voice": "energetic and motivational",
                "tone": "inspiring yet approachable",
            },
            "target_audience": {
                "age_range": "25-40",
                "interests": ["fitness", "health", "technology"],
                "demographics": "health-conscious professionals",
                "platforms": ["instagram", "facebook"],
            },
            "metadata": {
                "campaign_id": "camp_fitness_001",
                "user_id": "user_12345",
                "urgency": "high",
            },
        },
        "video_ad": {
            "prompt": "Create an engaging 30-second video ad for sustainable fashion brand",
            "type": "video",
            "brand_guidelines": {
                "primary_color": "#2E8B57",
                "secondary_color": "#F5F5DC",
                "brand_voice": "conscious and authentic",
                "values": ["sustainability", "ethical production"],
            },
            "target_audience": {
                "age_range": "22-35",
                "interests": ["sustainability", "fashion", "environment"],
                "demographics": "eco-conscious millennials",
            },
            "creative_requirements": {
                "duration": 30,
                "aspect_ratio": "16:9",
                "style": "natural and organic",
                "mood": "inspiring and hopeful",
            },
            "metadata": {"campaign_id": "camp_sustain_002", "deadline": "2024-09-15"},
        },
        "image_ad": {
            "prompt": "Design a striking image ad for premium coffee subscription service",
            "type": "image",
            "brand_guidelines": {
                "primary_color": "#8B4513",
                "secondary_color": "#F4E4BC",
                "brand_voice": "sophisticated and premium",
            },
            "target_audience": {
                "age_range": "30-50",
                "interests": ["coffee", "premium products", "convenience"],
                "demographics": "affluent professionals",
            },
            "creative_requirements": {
                "aspect_ratio": "1:1",
                "style": "minimalist premium",
                "key_elements": ["coffee beans", "premium packaging"],
            },
        },
    }


# Sample video prompts
def sample_video_prompts() -> List[Dict[str, Any]]:
    """Return sample video generation prompts."""
    return [
        {
            "description": "Modern office space with diverse team collaborating on innovative project",
            "style": "cinematic",
            "duration": 15,
            "aspect_ratio": "16:9",
            "quality": "hd",
            "mood": "professional and dynamic",
            "camera_movement": "smooth pan across workspace",
            "lighting": "natural with warm accents",
        },
        {
            "description": "Person using fitness app outdoors during morning workout",
            "style": "documentary",
            "duration": 20,
            "aspect_ratio": "9:16",
            "quality": "4k",
            "mood": "energetic and motivational",
            "camera_movement": "handheld following action",
            "lighting": "golden hour natural",
        },
        {
            "description": "Sustainable fashion products displayed in eco-friendly setting",
            "style": "lifestyle",
            "duration": 25,
            "aspect_ratio": "1:1",
            "quality": "hd",
            "mood": "calm and natural",
            "camera_movement": "slow zoom on products",
            "lighting": "soft diffused natural",
        },
    ]


# Mock API responses from video providers
def mock_video_provider_responses() -> Dict[str, Dict[str, Any]]:
    """Return mock responses from video generation providers."""
    return {
        "runway": {
            "success_response": {
                "id": "runway_gen_12345",
                "status": "completed",
                "video_url": "https://runway.ml/videos/12345.mp4",
                "thumbnail_url": "https://runway.ml/thumbnails/12345.jpg",
                "metadata": {
                    "duration": 30,
                    "resolution": "1920x1080",
                    "format": "mp4",
                    "generation_time": 45.2,
                },
            },
            "processing_response": {
                "id": "runway_gen_12346",
                "status": "processing",
                "progress": 65,
                "estimated_completion": "2024-08-13T15:30:00Z",
            },
            "error_response": {
                "error": "Content policy violation",
                "code": "CONTENT_REJECTED",
                "message": "The provided prompt violates our content guidelines",
            },
        },
        "pika": {
            "success_response": {
                "task_id": "pika_task_67890",
                "state": "finished",
                "result_url": "https://pika.art/videos/67890.mp4",
                "preview_url": "https://pika.art/previews/67890.gif",
                "details": {"width": 1024, "height": 576, "fps": 24, "duration": 4.0},
            },
            "failed_response": {
                "task_id": "pika_task_67891",
                "state": "failed",
                "error": "Generation timeout exceeded",
                "retry_count": 3,
            },
        },
        "stability": {
            "success_response": {
                "generation_id": "stable_vid_abc123",
                "status": "complete",
                "artifacts": [
                    {
                        "url": "https://api.stability.ai/v1/videos/abc123.mp4",
                        "type": "video/mp4",
                        "metadata": {"seed": 12345, "steps": 50, "cfg_scale": 7.5},
                    }
                ],
            }
        },
    }


# Sample analytics data
def sample_analytics_data() -> Dict[str, Any]:
    """Return sample analytics and performance data."""
    return {
        "campaign_performance": {
            "campaign_id": "camp_12345",
            "date_range": {"start": "2024-07-01", "end": "2024-07-31"},
            "metrics": {
                "impressions": 125000,
                "clicks": 6250,
                "conversions": 312,
                "spend": 3125.50,
                "ctr": 0.05,
                "conversion_rate": 0.0499,
                "cpc": 0.50,
                "cpa": 10.02,
                "roas": 4.2,
            },
            "demographic_breakdown": {
                "age_groups": {
                    "18-24": {"impressions": 25000, "conversions": 45},
                    "25-34": {"impressions": 50000, "conversions": 140},
                    "35-44": {"impressions": 35000, "conversions": 95},
                    "45+": {"impressions": 15000, "conversions": 32},
                },
                "locations": {
                    "urban": {"impressions": 75000, "conversions": 210},
                    "suburban": {"impressions": 37500, "conversions": 78},
                    "rural": {"impressions": 12500, "conversions": 24},
                },
            },
        },
        "creative_performance": {
            "creative_id": "creative_67890",
            "type": "video",
            "performance_by_platform": {
                "facebook": {
                    "impressions": 50000,
                    "clicks": 2500,
                    "video_views": 12500,
                    "video_completion_rate": 0.75,
                },
                "instagram": {
                    "impressions": 45000,
                    "clicks": 2700,
                    "video_views": 11250,
                    "video_completion_rate": 0.82,
                },
                "youtube": {
                    "impressions": 30000,
                    "clicks": 1050,
                    "video_views": 7500,
                    "video_completion_rate": 0.65,
                },
            },
        },
    }


# Sample workflow configurations
def sample_workflow_configs() -> Dict[str, Dict[str, Any]]:
    """Return sample workflow configurations."""
    return {
        "campaign_optimization": {
            "workflow_type": "campaign_optimization",
            "input_data": {
                "campaign_id": "camp_opt_001",
                "current_performance": sample_analytics_data()["campaign_performance"][
                    "metrics"
                ],
                "optimization_goals": ["increase_ctr", "reduce_cpc", "improve_roas"],
                "constraints": {
                    "max_budget_increase": 0.20,
                    "min_conversion_volume": 100,
                },
            },
            "configuration": {
                "analysis_period": "30d",
                "confidence_threshold": 0.85,
                "test_duration": "14d",
                "statistical_significance": 0.95,
            },
        },
        "audience_analysis": {
            "workflow_type": "audience_analysis",
            "input_data": {
                "campaign_data": sample_analytics_data()["campaign_performance"],
                "lookalike_sources": ["high_value_customers", "recent_converters"],
                "exclude_audiences": ["existing_customers"],
            },
            "configuration": {
                "similarity_threshold": 0.8,
                "min_audience_size": 10000,
                "geographic_expansion": True,
            },
        },
        "creative_testing": {
            "workflow_type": "creative_testing",
            "input_data": {
                "base_creative": "creative_67890",
                "test_variations": ["headline", "cta", "image", "video_hook"],
                "test_budget": 500.0,
            },
            "configuration": {
                "test_type": "a_b_split",
                "traffic_allocation": {"control": 0.5, "variants": 0.5},
                "success_metrics": ["ctr", "conversion_rate"],
            },
        },
    }


# Sample error scenarios
def sample_error_scenarios() -> Dict[str, Dict[str, Any]]:
    """Return sample error scenarios for testing."""
    return {
        "api_key_missing": {
            "error_type": "authentication_error",
            "status_code": 401,
            "message": "API key not provided or invalid",
            "details": {"required_headers": ["Authorization"], "provided_headers": []},
        },
        "rate_limit_exceeded": {
            "error_type": "rate_limit_error",
            "status_code": 429,
            "message": "API rate limit exceeded",
            "details": {
                "limit": 100,
                "window": "1h",
                "reset_time": "2024-08-13T16:00:00Z",
            },
        },
        "invalid_prompt": {
            "error_type": "validation_error",
            "status_code": 400,
            "message": "Prompt violates content policy",
            "details": {
                "violations": ["inappropriate_content", "trademark_mention"],
                "suggestions": ["Remove explicit references", "Use generic terms"],
            },
        },
        "service_timeout": {
            "error_type": "timeout_error",
            "status_code": 504,
            "message": "Request timeout exceeded",
            "details": {"timeout_duration": 30, "retry_after": 60},
        },
        "provider_unavailable": {
            "error_type": "service_error",
            "status_code": 503,
            "message": "Video generation provider temporarily unavailable",
            "details": {
                "provider": "runway",
                "estimated_recovery": "2024-08-13T14:30:00Z",
                "alternative_providers": ["pika", "stability"],
            },
        },
    }


# Test file utilities
def create_temp_video_file(duration_seconds: int = 30) -> str:
    """Create a temporary video file for testing."""
    temp_file = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    # Write fake video content (in real tests, this would be actual video data)
    fake_video_content = b"FAKE_VIDEO_DATA" * (duration_seconds * 100)
    temp_file.write(fake_video_content)
    temp_file.flush()
    return temp_file.name


def create_temp_image_file(width: int = 1024, height: int = 1024) -> str:
    """Create a temporary image file for testing."""
    temp_file = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    # Write fake image content
    fake_image_content = b"FAKE_PNG_DATA" * (width * height // 100)
    temp_file.write(fake_image_content)
    temp_file.flush()
    return temp_file.name


def cleanup_temp_files(file_paths: List[str]) -> None:
    """Clean up temporary files after testing."""
    for file_path in file_paths:
        try:
            os.unlink(file_path)
        except FileNotFoundError:
            pass  # File already cleaned up


# Mock environment configurations
def mock_test_environment() -> Dict[str, str]:
    """Return mock environment variables for testing."""
    return {
        "TESTING": "true",
        "LOG_LEVEL": "debug",
        "OPENAI_API_KEY": "test_openai_key_12345",
        "GOOGLE_API_KEY": "test_google_key_67890",
        "RUNWAY_API_KEY": "test_runway_key_abcde",
        "PIKA_API_KEY": "test_pika_key_fghij",
        "STABILITY_API_KEY": "test_stability_key_klmno",
        "LUMA_API_KEY": "test_luma_key_pqrst",
        "FIREBASE_STORAGE_BUCKET": "test-ceaser-advt-genius.appspot.com",
        "FIREBASE_VIDEO_PREFIX": "test-videos",
        "FIREBASE_SERVICE_ACCOUNT": "./firebase/test-service-account.json",
        "GRPC_PORT": "50052",
        "GRPC_HOST": "localhost",
    }


# Performance benchmarks
def performance_benchmarks() -> Dict[str, Dict[str, float]]:
    """Return expected performance benchmarks for testing."""
    return {
        "creative_generation": {
            "text_generation_max_time": 5.0,  # seconds
            "image_generation_max_time": 15.0,
            "video_generation_max_time": 60.0,
            "prompt_enhancement_max_time": 3.0,
        },
        "workflow_execution": {
            "simple_analysis_max_time": 10.0,
            "complex_optimization_max_time": 120.0,
            "audience_analysis_max_time": 30.0,
        },
        "storage_operations": {
            "file_upload_max_time": 10.0,
            "url_generation_max_time": 1.0,
            "file_deletion_max_time": 2.0,
        },
    }


# Quality thresholds
def quality_thresholds() -> Dict[str, Dict[str, float]]:
    """Return quality thresholds for validation testing."""
    return {
        "prompt_quality": {
            "minimum_score": 3.0,
            "good_score": 6.0,
            "excellent_score": 8.5,
        },
        "content_quality": {
            "minimum_coherence": 0.7,
            "minimum_relevance": 0.8,
            "minimum_originality": 0.6,
        },
        "performance_metrics": {
            "minimum_ctr": 0.01,
            "good_ctr": 0.03,
            "minimum_conversion_rate": 0.005,
            "good_conversion_rate": 0.02,
        },
    }
