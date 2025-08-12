#!/usr/bin/env python3
"""
Simple test script for video generation without complex imports
"""
import asyncio
import sys
import os

# Add parent directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

async def main():
    try:
        from app.services.video_generation import VideoGenerationService, VideoPrompt
        
        print("🎬 Testing Video Generation Service...")
        
        # Initialize service
        svc = VideoGenerationService()
        
        # List supported models
        models = svc.get_supported_models()
        print(f"✅ Supported models: {models}")
        
        # Create a test prompt
        prompt = VideoPrompt(
            prompt="A vibrant product showcase with upbeat music",
            duration_seconds=10,
            aspect_ratio="16:9",
            style="cinematic"
        )
        
        # Test generation with different models
        for model in ["runway_gen3", "pika_v2"]:
            print(f"\n🎥 Testing {model}...")
            result = await svc.generate(model=model, prompt=prompt, variations=1)
            
            if result.get("success"):
                print(f"✅ {model}: Generated {len(result['results'])} variation(s)")
                for i, video in enumerate(result['results']):
                    print(f"   Video {i+1}: {video['content_url']}")
            else:
                print(f"❌ {model}: Failed")
        
        print("\n🎉 Video generation test completed!")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you're running from the correct directory")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
