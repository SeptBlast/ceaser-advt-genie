import asyncio
import sys
import os

# Add parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.video_generation import VideoGenerationService, VideoPrompt


async def main():
    svc = VideoGenerationService()
    print("Supported models:", svc.get_supported_models())
    prompt = VideoPrompt(prompt="A vibrant product showcase with upbeat music")
    res = await svc.generate(model="runway_gen3", prompt=prompt, variations=2)
    print("Result:", res)


if __name__ == "__main__":
    asyncio.run(main())
