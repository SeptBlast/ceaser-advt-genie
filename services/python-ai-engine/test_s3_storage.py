#!/usr/bin/env python3
"""
Test script for S3 video storage functionality.
"""
import asyncio
import os
import sys
from datetime import datetime

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.video_generation import VideoGenerationService, VideoPrompt


async def test_video_generation_with_s3():
    """Test video generation with S3 storage integration."""
    print("🎬 Testing Video Generation with S3 Storage...")
    
    # Initialize service
    video_service = VideoGenerationService()
    
    # Test data
    tenant_name = "test-tenant"
    creative_id = "creative-123"
    
    # Create test prompt
    prompt = VideoPrompt(
        prompt="A beautiful sunset over the ocean with waves gently lapping the shore",
        duration_seconds=10,
        style="cinematic",
        mood="peaceful"
    )
    
    # Test with runway model
    print(f"\n✅ Testing with runway_gen3 model...")
    result = await video_service.generate(
        model="runway_gen3",
        prompt=prompt,
        tenant_name=tenant_name,
        creative_id=creative_id,
        variations=2
    )
    
    print(f"Success: {result['success']}")
    print(f"Provider: {result['provider']}")
    print(f"Model: {result['model']}")
    
    for i, video in enumerate(result['results']):
        print(f"\n📹 Video {i+1}:")
        print(f"  Original URL: {video['content_url']}")
        print(f"  S3 URL: {video['s3_url']}")
        print(f"  Job ID: {video['job_id']}")
    
    # Test listing tenant videos
    print(f"\n📋 Listing videos for tenant: {tenant_name}")
    tenant_videos = await video_service.list_tenant_videos(tenant_name)
    
    if tenant_videos:
        for video in tenant_videos[:3]:  # Show first 3
            print(f"  📁 {video['key']}")
            print(f"     Creative ID: {video.get('creative_id', 'N/A')}")
            print(f"     Size: {video['size']} bytes")
            print(f"     Uploaded: {video.get('uploaded_at', 'N/A')}")
    else:
        print("  No videos found (S3 not configured or mock URLs)")
    
    print("\n🎉 Video generation with S3 storage test completed!")


async def test_s3_configuration():
    """Test S3 configuration and connectivity."""
    print("🔧 Testing S3 Configuration...")
    
    from app.services.s3_storage import S3VideoStorage
    
    storage = S3VideoStorage()
    
    print(f"Bucket: {storage.bucket_name}")
    print(f"Region: {storage.region}")
    print(f"Prefix: {storage.prefix}")
    print(f"S3 Client Available: {storage.s3_client is not None}")
    
    if storage.s3_client:
        print("✅ S3 client initialized successfully")
    else:
        print("⚠️ S3 client not available (credentials not configured)")


if __name__ == "__main__":
    print("🚀 S3 Video Storage Test Suite")
    print("=" * 50)
    
    # Test S3 configuration
    asyncio.run(test_s3_configuration())
    
    print("\n" + "=" * 50)
    
    # Test video generation
    asyncio.run(test_video_generation_with_s3())
