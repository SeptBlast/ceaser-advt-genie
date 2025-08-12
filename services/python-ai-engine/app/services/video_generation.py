import os
import random
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional

import structlog
from .firebase_storage import FirebaseVideoStorage

logger = structlog.get_logger()


class VideoModel(str, Enum):
    RUNWAY_GEN3 = "runway_gen3"
    PIKA_V2 = "pika_v2"
    STABILITY_SVD = "stability_svd"
    LUMA_DREAM = "luma_dream"
    GOOGLE_VEO = "google_veo"
    OPENAI_SHORTS = "openai_shorts"  # placeholder


@dataclass
class VideoPrompt:
    # Quantified prompt fields for deterministic generation
    prompt: str
    duration_seconds: int = 10
    aspect_ratio: str = "16:9"  # e.g., 9:16, 1:1, 4:5
    resolution: str = "1080p"  # 720p, 1080p, 4k
    fps: int = 24
    style: str = "cinematic"
    mood: str = "uplifting"
    camera: str = "smooth dolly-in"
    color_palette: Optional[str] = None
    music: Optional[str] = None
    voiceover_script: Optional[str] = None
    text_overlays: Optional[List[str]] = None
    subtitles: bool = False
    brand_colors: Optional[List[str]] = None
    seed: Optional[int] = None


@dataclass
class GenerationResult:
    success: bool
    content_url: Optional[str]
    firebase_url: Optional[str]  # Changed from s3_url to firebase_url
    job_id: Optional[str]
    model: str
    provider: str
    params: Dict[str, Any]
    message: str


class BaseVideoProvider:
    name: str = "base"

    def __init__(self, api_key_env: Optional[str] = None) -> None:
        self.api_key_env = api_key_env
        self.api_key = os.getenv(api_key_env) if api_key_env else None

    async def generate(
        self, prompt: VideoPrompt, assets: Optional[Dict[str, Any]] = None
    ) -> GenerationResult:
        raise NotImplementedError


class MockProvider(BaseVideoProvider):
    name = "mock"

    async def generate(
        self, prompt: VideoPrompt, assets: Optional[Dict[str, Any]] = None
    ) -> GenerationResult:
        # Simulate generation and return a deterministic fake URL
        seed = prompt.seed or random.randint(1, 10_000_000)
        vid_id = f"mock_{seed}"
        url = f"https://cdn.example.com/generated/videos/{vid_id}.mp4"
        logger.info("Mock video generated", url=url, seed=seed, style=prompt.style)
        return GenerationResult(
            success=True,
            content_url=url,
            firebase_url=None,  # Firebase URL will be populated by storage service
            job_id=vid_id,
            model="mock",
            provider=self.name,
            params={
                "duration": prompt.duration_seconds,
                "aspect_ratio": prompt.aspect_ratio,
                "resolution": prompt.resolution,
                "fps": prompt.fps,
                "style": prompt.style,
            },
            message="Mock generation complete",
        )


class RunwayProvider(BaseVideoProvider):
    name = "runway"

    def __init__(self) -> None:
        super().__init__(api_key_env="RUNWAY_API_KEY")

    async def generate(
        self, prompt: VideoPrompt, assets: Optional[Dict[str, Any]] = None
    ) -> GenerationResult:
        if not self.api_key:
            logger.warning("RUNWAY_API_KEY not set; falling back to mock-like response")
        # Placeholder: integrate Runway Gen-3 API here
        seed = prompt.seed or random.randint(1, 10_000_000)
        job_id = f"runway_{seed}"
        url = f"https://runway-public.example/{job_id}.mp4"
        return GenerationResult(
            True,
            url,
            None,  # Firebase URL will be populated by storage service
            job_id,
            VideoModel.RUNWAY_GEN3.value,
            self.name,
            prompt.__dict__,
            "Runway request accepted",
        )


class PikaProvider(BaseVideoProvider):
    name = "pika"

    def __init__(self) -> None:
        super().__init__(api_key_env="PIKA_API_KEY")

    async def generate(
        self, prompt: VideoPrompt, assets: Optional[Dict[str, Any]] = None
    ) -> GenerationResult:
        seed = prompt.seed or random.randint(1, 10_000_000)
        job_id = f"pika_{seed}"
        url = f"https://pika-public.example/{job_id}.mp4"
        return GenerationResult(
            True,
            url,
            None,  # Firebase URL will be populated by storage service
            job_id,
            VideoModel.PIKA_V2.value,
            self.name,
            prompt.__dict__,
            "Pika request accepted",
        )


class StabilitySVDProvider(BaseVideoProvider):
    name = "stability"

    def __init__(self) -> None:
        super().__init__(api_key_env="STABILITY_API_KEY")

    async def generate(
        self, prompt: VideoPrompt, assets: Optional[Dict[str, Any]] = None
    ) -> GenerationResult:
        seed = prompt.seed or random.randint(1, 10_000_000)
        job_id = f"svd_{seed}"
        url = f"https://stability-public.example/{job_id}.mp4"
        return GenerationResult(
            True,
            url,
            None,  # Firebase URL will be populated by storage service
            job_id,
            VideoModel.STABILITY_SVD.value,
            self.name,
            prompt.__dict__,
            "Stability request accepted",
        )


class LumaProvider(BaseVideoProvider):
    name = "luma"

    def __init__(self) -> None:
        super().__init__(api_key_env="LUMA_API_KEY")

    async def generate(
        self, prompt: VideoPrompt, assets: Optional[Dict[str, Any]] = None
    ) -> GenerationResult:
        seed = prompt.seed or random.randint(1, 10_000_000)
        job_id = f"luma_{seed}"
        url = f"https://luma-public.example/{job_id}.mp4"
        return GenerationResult(
            True,
            url,
            None,  # Firebase URL will be populated by storage service
            job_id,
            VideoModel.LUMA_DREAM.value,
            self.name,
            prompt.__dict__,
            "Luma request accepted",
        )


class GoogleVeoProvider(BaseVideoProvider):
    name = "google_veo"

    def __init__(self) -> None:
        super().__init__(api_key_env="GOOGLE_API_KEY")  # placeholder env

    async def generate(
        self, prompt: VideoPrompt, assets: Optional[Dict[str, Any]] = None
    ) -> GenerationResult:
        seed = prompt.seed or random.randint(1, 10_000_000)
        job_id = f"veo_{seed}"
        url = f"https://google-veo-public.example/{job_id}.mp4"
        return GenerationResult(
            True,
            url,
            None,  # Firebase URL will be populated by storage service
            job_id,
            VideoModel.GOOGLE_VEO.value,
            self.name,
            prompt.__dict__,
            "Google Veo request accepted",
        )


class OpenAIShortsProvider(BaseVideoProvider):
    name = "openai"

    def __init__(self) -> None:
        super().__init__(api_key_env="OPENAI_API_KEY")

    async def generate(
        self, prompt: VideoPrompt, assets: Optional[Dict[str, Any]] = None
    ) -> GenerationResult:
        seed = prompt.seed or random.randint(1, 10_000_000)
        job_id = f"oai_{seed}"
        url = f"https://openai-shorts-public.example/{job_id}.mp4"
        return GenerationResult(
            True,
            url,
            None,  # Firebase URL will be populated by storage service
            job_id,
            VideoModel.OPENAI_SHORTS.value,
            self.name,
            prompt.__dict__,
            "OpenAI request accepted",
        )


class VideoGenerationService:
    """
    Orchestrates video generation across multiple third-party providers.
    Provides a unified interface and selection by model name for end users.
    """

    def __init__(self) -> None:
        self.providers: Dict[VideoModel, BaseVideoProvider] = {
            VideoModel.RUNWAY_GEN3: RunwayProvider(),
            VideoModel.PIKA_V2: PikaProvider(),
            VideoModel.STABILITY_SVD: StabilitySVDProvider(),
            VideoModel.LUMA_DREAM: LumaProvider(),
            VideoModel.GOOGLE_VEO: GoogleVeoProvider(),
            VideoModel.OPENAI_SHORTS: OpenAIShortsProvider(),
        }
        self.mock = MockProvider()
        self.firebase_storage = (
            FirebaseVideoStorage()
        )  # Initialize Firebase storage service

    def get_supported_models(self) -> List[str]:
        return [m.value for m in VideoModel]

    def _select_provider(self, model: str) -> BaseVideoProvider:
        try:
            vm = VideoModel(model)
        except Exception:
            logger.warning(
                "Unknown model requested; using google_veo as default", model=model
            )
            return self.providers[VideoModel.GOOGLE_VEO]

        provider = self.providers.get(vm, self.providers[VideoModel.GOOGLE_VEO])
        # If provider lacks API key, still return it; the provider handles fallback behavior
        return provider

    async def generate(
        self,
        model: str,
        prompt: VideoPrompt,
        tenant_name: str,
        creative_id: str,
        assets: Optional[Dict[str, Any]] = None,
        variations: int = 1,
    ) -> Dict[str, Any]:
        provider = self._select_provider(model)
        results: List[GenerationResult] = []

        for i in range(variations):
            # vary seed for each variation unless fixed
            p = prompt
            if prompt.seed is None:
                p = VideoPrompt(
                    **{**prompt.__dict__, "seed": random.randint(1, 10_000_000)}
                )
            res = await provider.generate(p, assets)

            # Store video in Firebase Storage if generation was successful
            if res.success and res.content_url:
                firebase_url = await self.firebase_storage.download_and_store_video(
                    video_url=res.content_url,
                    tenant_name=tenant_name,
                    creative_id=creative_id,
                    iteration=i + 1,
                )
                res.firebase_url = firebase_url
                logger.info(
                    "Video stored in Firebase Storage",
                    tenant=tenant_name,
                    creative_id=creative_id,
                    iteration=i + 1,
                    firebase_url=firebase_url,
                    original_url=res.content_url,
                )

            results.append(res)

        return {
            "success": all(r.success for r in results),
            "provider": provider.name,
            "model": model,
            "results": [
                {
                    "content_url": r.content_url,
                    "firebase_url": r.firebase_url,
                    "job_id": r.job_id,
                    "params": r.params,
                    "message": r.message,
                }
                for r in results
            ],
            "supported_models": self.get_supported_models(),
        }

    async def list_tenant_videos(
        self, tenant_name: str, limit: int = 100
    ) -> List[Dict]:
        """List all videos stored for a specific tenant."""
        return self.firebase_storage.list_tenant_videos(tenant_name, limit)

    def generate_signed_url(
        self, firebase_path: str, expiration: int = 3600
    ) -> Optional[str]:
        """Generate a signed URL for secure video access."""
        return self.firebase_storage.generate_signed_url(firebase_path, expiration)

    def delete_video(self, firebase_path: str) -> bool:
        """Delete a video from Firebase Storage."""
        return self.firebase_storage.delete_video(firebase_path)
