#!/usr/bin/env python3
"""
Test to verify Google Veo is the default model.
"""

import os
import sys
import asyncio
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.services.video_generation import VideoGenerationService, VideoPrompt


async def test_google_veo_default():
    """Test that Google Veo is used as the default model."""
    print("🧪 Testing Google Veo as Default Model")
    print("=" * 50)

    service = VideoGenerationService()

    # Test 1: Unknown model should use Google Veo
    print("\n1️⃣ Testing unknown model fallback...")
    provider = service._select_provider("unknown_model")
    print(f"   Provider name: {provider.name}")
    print(f"   Expected: google_veo")
    print(f"   ✅ PASS" if provider.name == "google_veo" else f"   ❌ FAIL")

    # Test 2: Explicitly request Google Veo
    print("\n2️⃣ Testing explicit google_veo model...")
    provider = service._select_provider("google_veo")
    print(f"   Provider name: {provider.name}")
    print(f"   Expected: google_veo")
    print(f"   ✅ PASS" if provider.name == "google_veo" else f"   ❌ FAIL")

    # Test 3: Generate video with unknown model
    print("\n3️⃣ Testing video generation with unknown model...")
    prompt = VideoPrompt(
        prompt="A test video with Google Veo as default",
        duration_seconds=5,
        style="cinematic",
    )

    result = await service.generate(
        model="unknown_test_model",
        prompt=prompt,
        tenant_name="test-tenant",
        creative_id="default-model-test",
        variations=1,
    )

    if result and result.get("results"):
        content_url = result["results"][0].get("content_url", "")
        print(f"   Generated URL: {content_url}")
        print(f"   Contains 'veo': {'veo' in content_url}")
        print(f"   ✅ PASS" if "veo" in content_url else f"   ❌ FAIL")
    else:
        print("   ❌ FAIL - No results generated")

    # Test 4: Show supported models
    print("\n4️⃣ Supported models:")
    models = service.get_supported_models()
    for model in models:
        print(f"   - {model}")

    print(
        f"\n🎯 Google Veo (google_veo) is {'✅ included' if 'google_veo' in models else '❌ missing'}"
    )

    print("\n🎊 Default model test completed!")


if __name__ == "__main__":
    asyncio.run(test_google_veo_default())
