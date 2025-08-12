import os
import json
from typing import Any, Dict, Optional

import structlog
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

from .video_generation import VideoPrompt

logger = structlog.get_logger()


class PromptRegenerator:
    """
    Quantifies free-form user prompts into structured VideoPrompt fields
    and supports regeneration with feedback for more tailored outputs.
    """

    def __init__(self) -> None:
        self.llm = self._init_llm()
        self.quantify_prompt = self._quantify_prompt_template()
        self.refine_prompt = self._refine_prompt_template()

    def _init_llm(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            return ChatOpenAI(
                api_key=api_key, model="gpt-4o-mini", temperature=0.2, max_tokens=1000
            )
        gkey = os.getenv("GOOGLE_API_KEY")
        if gkey:
            return ChatGoogleGenerativeAI(
                model="gemini-1.5-pro",
                google_api_key=gkey,
                temperature=0.2,
                max_output_tokens=1000,
            )
        return None

    def _quantify_prompt_template(self) -> PromptTemplate:
        template = (
            "You are a creative video director. Convert the following context and user prompt into a STRICT JSON object "
            "that matches this schema keys only: prompt, duration_seconds, aspect_ratio, resolution, fps, style, mood, "
            "camera, color_palette, music, voiceover_script, text_overlays, subtitles, brand_colors.\n"
            "- duration_seconds must be an integer (5-60).\n"
            "- aspect_ratio from [9:16, 16:9, 1:1, 4:5].\n"
            "- resolution from [720p, 1080p, 4k].\n"
            "- fps in [24, 30, 60].\n"
            "- text_overlays is an array of short strings.\n"
            "- brand_colors is an array of HEX strings if available.\n"
            "If any field is missing, infer sensible defaults.\n\n"
            "Campaign Context: {campaign_context}\n"
            "Brand Guidelines: {brand_guidelines}\n"
            "Target Audience: {target_audience}\n"
            "User Prompt: {user_prompt}\n\n"
            "Return ONLY valid JSON without backticks."
        )
        return PromptTemplate(
            input_variables=[
                "campaign_context",
                "brand_guidelines",
                "target_audience",
                "user_prompt",
            ],
            template=template,
        )

    def _refine_prompt_template(self) -> PromptTemplate:
        template = (
            "You are improving a structured video prompt JSON for better ad performance.\n"
            "Given the prior JSON prompt and feedback, produce a new JSON with the same keys, tightly aligned to the feedback.\n"
            "Maintain constraints for duration, aspect_ratio, resolution, and fps.\n\n"
            "Prior JSON Prompt: {prior_json}\n"
            "Feedback: {feedback}\n\n"
            "Return ONLY valid JSON without backticks."
        )
        return PromptTemplate(
            input_variables=["prior_json", "feedback"], template=template
        )

    async def quantify(
        self,
        user_prompt: str,
        campaign_context: Dict[str, Any],
        brand_guidelines: Any,
        target_audience: Any,
    ) -> VideoPrompt:
        # Fallback if no LLM
        if not self.llm:
            logger.warning(
                "No LLM available for prompt quantification; using heuristic defaults"
            )
            return VideoPrompt(
                prompt=user_prompt,
                duration_seconds=10,
                aspect_ratio=(
                    "9:16"
                    if str(campaign_context).lower().find("tiktok") >= 0
                    else "16:9"
                ),
                resolution="1080p",
                fps=24,
                style=(
                    "dynamic social-first"
                    if "tiktok" in str(campaign_context).lower()
                    else "cinematic"
                ),
                mood="uplifting",
                camera=(
                    "handheld energy"
                    if "tiktok" in str(campaign_context).lower()
                    else "smooth dolly-in"
                ),
                subtitles=True,
            )

        chain = LLMChain(llm=self.llm, prompt=self.quantify_prompt, verbose=False)
        result = await chain.arun(
            campaign_context=json.dumps(campaign_context),
            brand_guidelines=str(brand_guidelines),
            target_audience=str(target_audience),
            user_prompt=user_prompt,
        )
        try:
            data = json.loads(result)
        except Exception:
            logger.warning(
                "LLM returned non-JSON; falling back to heuristic", raw=result[:200]
            )
            return await self.quantify(
                user_prompt, campaign_context, brand_guidelines, target_audience
            )

        # Build VideoPrompt with safe defaults
        return VideoPrompt(
            prompt=data.get("prompt", user_prompt),
            duration_seconds=int(data.get("duration_seconds", 10)),
            aspect_ratio=str(data.get("aspect_ratio", "16:9")),
            resolution=str(data.get("resolution", "1080p")),
            fps=int(data.get("fps", 24)),
            style=str(data.get("style", "cinematic")),
            mood=str(data.get("mood", "uplifting")),
            camera=str(data.get("camera", "smooth dolly-in")),
            color_palette=data.get("color_palette"),
            music=data.get("music"),
            voiceover_script=data.get("voiceover_script"),
            text_overlays=data.get("text_overlays"),
            subtitles=bool(data.get("subtitles", False)),
            brand_colors=data.get("brand_colors"),
        )

    async def regenerate_with_feedback(
        self, prior_prompt: VideoPrompt, feedback: str
    ) -> VideoPrompt:
        if not self.llm:
            logger.warning(
                "No LLM available for prompt regeneration; applying minimal heuristic changes"
            )
            # Adjust mood/style heuristically based on feedback keywords
            mood = "energetic" if "energy" in feedback.lower() else prior_prompt.mood
            style = (
                "social-first" if "social" in feedback.lower() else prior_prompt.style
            )
            return VideoPrompt(
                **{**prior_prompt.__dict__, "mood": mood, "style": style}
            )

        chain = LLMChain(llm=self.llm, prompt=self.refine_prompt, verbose=False)
        result = await chain.arun(
            prior_json=json.dumps(prior_prompt.__dict__), feedback=feedback
        )
        try:
            data = json.loads(result)
        except Exception:
            logger.warning(
                "LLM returned non-JSON on refine; using prior with small tweaks",
                raw=result[:200],
            )
            return prior_prompt

        return VideoPrompt(
            prompt=data.get("prompt", prior_prompt.prompt),
            duration_seconds=int(
                data.get("duration_seconds", prior_prompt.duration_seconds)
            ),
            aspect_ratio=str(data.get("aspect_ratio", prior_prompt.aspect_ratio)),
            resolution=str(data.get("resolution", prior_prompt.resolution)),
            fps=int(data.get("fps", prior_prompt.fps)),
            style=str(data.get("style", prior_prompt.style)),
            mood=str(data.get("mood", prior_prompt.mood)),
            camera=str(data.get("camera", prior_prompt.camera)),
            color_palette=data.get("color_palette", prior_prompt.color_palette),
            music=data.get("music", prior_prompt.music),
            voiceover_script=data.get(
                "voiceover_script", prior_prompt.voiceover_script
            ),
            text_overlays=data.get("text_overlays", prior_prompt.text_overlays),
            subtitles=bool(data.get("subtitles", prior_prompt.subtitles)),
            brand_colors=data.get("brand_colors", prior_prompt.brand_colors),
        )
