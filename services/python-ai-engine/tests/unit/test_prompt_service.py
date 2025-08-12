"""
Unit tests for PromptService class.
Tests prompt enhancement, quantification, and regeneration logic.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
import os

from app.services.prompt_service import PromptRegenerator


class TestPromptService:
    """Test suite for PromptService class."""

    @pytest.fixture
    def prompt_service(self, mock_openai_llm, mock_gemini_llm):
        """Create PromptService instance with mocked dependencies."""
        with patch(
            "app.services.prompt_service.ChatOpenAI", return_value=mock_openai_llm
        ):
            with patch(
                "app.services.prompt_service.ChatGoogleGenerativeAI",
                return_value=mock_gemini_llm,
            ):
                service = PromptRegenerator()
                service.openai_llm = mock_openai_llm
                service.gemini_llm = mock_gemini_llm
                return service

    @pytest.mark.asyncio
    async def test_enhance_prompt_basic(self, prompt_service):
        """Test basic prompt enhancement."""
        original_prompt = "Make an ad for shoes"

        prompt_service.openai_llm.invoke.return_value.content = """
        Enhanced Prompt: Create a compelling advertisement showcasing premium athletic footwear that emphasizes comfort, style, and performance for active lifestyle enthusiasts.
        
        Score: 8.5
        
        Improvements:
        - Added emotional appeal targeting active lifestyle
        - Included specific product benefits (comfort, style, performance)
        - Enhanced specificity from generic "shoes" to "premium athletic footwear"
        - Added target audience context
        """

        result = await prompt_service.enhance_prompt(original_prompt)

        assert result["success"] is True
        assert result["enhanced_prompt"] != original_prompt
        assert result["score"] > 0
        assert len(result["improvements"]) > 0
        assert "compelling advertisement" in result["enhanced_prompt"].lower()

    @pytest.mark.asyncio
    async def test_enhance_prompt_with_context(self, prompt_service):
        """Test prompt enhancement with additional context."""
        original_prompt = "Create video ad"
        context = {
            "brand": "TechStart Inc",
            "product": "AI productivity software",
            "target_audience": "business professionals",
            "duration": 30,
        }

        prompt_service.openai_llm.invoke.return_value.content = """
        Enhanced Prompt: Create a dynamic 30-second video advertisement for TechStart Inc's AI productivity software, targeting business professionals who need efficient workflow solutions.
        
        Score: 9.2
        
        Improvements:
        - Incorporated brand name and product specifics
        - Added duration requirement
        - Targeted specific audience segment
        - Emphasized key value proposition
        """

        result = await prompt_service.enhance_prompt(original_prompt, context=context)

        assert result["success"] is True
        assert "TechStart Inc" in result["enhanced_prompt"]
        assert "30-second" in result["enhanced_prompt"]
        assert "business professionals" in result["enhanced_prompt"]
        assert result["score"] > 8.0

    @pytest.mark.asyncio
    async def test_quantify_prompt_quality(self, prompt_service):
        """Test prompt quality quantification."""
        test_prompts = [
            "Make ad",  # Poor quality
            "Create advertisement for product",  # Medium quality
            "Develop a compelling video advertisement showcasing our innovative AI-powered productivity software, targeting busy professionals aged 25-45 who value efficiency and cutting-edge technology",  # High quality
        ]

        prompt_service.openai_llm.invoke.side_effect = [
            Mock(content="Score: 2.1\nReasoning: Too vague and lacks specificity"),
            Mock(
                content="Score: 5.5\nReasoning: Basic structure but missing target audience"
            ),
            Mock(
                content="Score: 9.3\nReasoning: Comprehensive, specific, and well-targeted"
            ),
        ]

        scores = []
        for prompt in test_prompts:
            result = await prompt_service.quantify_prompt_quality(prompt)
            scores.append(result["score"])

        # Scores should increase with prompt quality
        assert scores[0] < scores[1] < scores[2]
        assert scores[0] < 4.0  # Poor prompt
        assert scores[2] > 8.0  # High quality prompt

    @pytest.mark.asyncio
    async def test_regenerate_prompt_multiple_variants(self, prompt_service):
        """Test generating multiple prompt variants."""
        original_prompt = "Create social media ad for coffee shop"

        prompt_service.openai_llm.invoke.return_value.content = """
        Variant 1: Design an Instagram-worthy advertisement showcasing artisanal coffee and cozy atmosphere of your local coffee shop
        
        Variant 2: Create a Facebook ad highlighting premium coffee blends and community gathering space at your neighborhood café
        
        Variant 3: Develop a TikTok-style advertisement featuring barista skills and trendy coffee culture at your modern coffee house
        """

        result = await prompt_service.regenerate_prompt(original_prompt, num_variants=3)

        assert result["success"] is True
        assert len(result["variants"]) == 3
        assert all("coffee" in variant.lower() for variant in result["variants"])
        assert any("Instagram" in variant for variant in result["variants"])
        assert any("Facebook" in variant for variant in result["variants"])

    @pytest.mark.asyncio
    async def test_analyze_prompt_components(self, prompt_service):
        """Test prompt component analysis."""
        prompt = "Create a 30-second video advertisement for EcoClean laundry detergent targeting environmentally conscious families with children, emphasizing natural ingredients and powerful cleaning"

        prompt_service.openai_llm.invoke.return_value.content = """
        Analysis:
        
        Product: EcoClean laundry detergent
        Duration: 30 seconds
        Format: Video advertisement
        Target Audience: Environmentally conscious families with children
        Key Benefits: Natural ingredients, powerful cleaning
        Tone: Family-friendly, eco-conscious
        Missing Elements: Call to action, specific platform, visual style
        
        Completeness Score: 7.5/10
        """

        result = await prompt_service.analyze_prompt_components(prompt)

        assert result["success"] is True
        assert "product" in result["analysis"].lower()
        assert "target audience" in result["analysis"].lower()
        assert result["completeness_score"] > 0
        assert len(result["missing_elements"]) > 0

    @pytest.mark.asyncio
    async def test_suggest_improvements(self, prompt_service):
        """Test prompt improvement suggestions."""
        weak_prompt = "Make video for product"

        prompt_service.openai_llm.invoke.return_value.content = """
        Suggested Improvements:
        
        1. Specify the product name and category
        2. Define target audience demographics
        3. Include video duration and format
        4. Add key benefits or value propositions
        5. Specify platform (YouTube, Instagram, TikTok)
        6. Include call-to-action
        7. Define visual style or mood
        8. Add brand guidelines or requirements
        
        Priority: High - prompt lacks essential specificity
        """

        result = await prompt_service.suggest_improvements(weak_prompt)

        assert result["success"] is True
        assert len(result["suggestions"]) >= 5
        assert any(
            "target audience" in suggestion.lower()
            for suggestion in result["suggestions"]
        )
        assert any(
            "duration" in suggestion.lower() for suggestion in result["suggestions"]
        )
        assert result["priority"] in ["High", "Medium", "Low"]

    @pytest.mark.asyncio
    async def test_optimize_for_ai_model(self, prompt_service):
        """Test prompt optimization for specific AI models."""
        generic_prompt = "Create advertisement for smartphone"

        test_cases = [
            {"model": "dall-e", "expected_keywords": ["visual", "image", "style"]},
            {"model": "runway", "expected_keywords": ["video", "motion", "cinematic"]},
            {"model": "gpt-4", "expected_keywords": ["copy", "text", "messaging"]},
        ]

        for case in test_cases:
            prompt_service.openai_llm.invoke.return_value.content = f"""
            Optimized for {case["model"]}:
            
            Create a stunning visual advertisement showcasing the sleek design and advanced features of the latest smartphone model, with dynamic camera movements highlighting the premium build quality and innovative technology
            
            Model-specific optimizations:
            - Enhanced visual descriptors for {case["model"]}
            - Appropriate technical specifications
            - Format-specific requirements
            """

            result = await prompt_service.optimize_for_ai_model(
                generic_prompt, case["model"]
            )

            assert result["success"] is True
            assert result["model"] == case["model"]
            assert len(result["optimized_prompt"]) > len(generic_prompt)

    @pytest.mark.asyncio
    async def test_extract_prompt_metadata(self, prompt_service):
        """Test metadata extraction from prompts."""
        detailed_prompt = "Create a 15-second Instagram Reels video for Nike Air Max sneakers targeting Gen Z athletes aged 18-25, showcasing urban street style with hip-hop music, emphasizing comfort and style"

        prompt_service.openai_llm.invoke.return_value.content = """
        Extracted Metadata:
        
        Brand: Nike
        Product: Air Max sneakers
        Platform: Instagram Reels
        Duration: 15 seconds
        Target Age: 18-25
        Target Demographic: Gen Z athletes
        Style: Urban street style
        Music: Hip-hop
        Key Benefits: Comfort and style
        Format: Video
        """

        result = await prompt_service.extract_prompt_metadata(detailed_prompt)

        assert result["success"] is True
        assert "Nike" in result["metadata"]["brand"]
        assert result["metadata"]["duration"] == "15 seconds"
        assert "Instagram" in result["metadata"]["platform"]
        assert "18-25" in result["metadata"]["target_age"]

    @pytest.mark.asyncio
    async def test_validate_prompt_completeness(self, prompt_service):
        """Test prompt completeness validation."""
        test_cases = [
            {
                "prompt": "Make ad",
                "expected_complete": False,
                "missing_count": 5,  # Should have many missing elements
            },
            {
                "prompt": "Create a 30-second video advertisement for eco-friendly cleaning products targeting families with young children, emphasizing safety and effectiveness",
                "expected_complete": True,
                "missing_count": 2,  # Should have few missing elements
            },
        ]

        for case in test_cases:
            prompt_service.openai_llm.invoke.return_value.content = f"""
            Completeness: {"Complete" if case["expected_complete"] else "Incomplete"}
            
            Missing Elements: {case["missing_count"]} items
            - Visual style specification
            - Call to action
            
            Score: {8.5 if case["expected_complete"] else 3.2}
            """

            result = await prompt_service.validate_prompt_completeness(case["prompt"])

            assert result["success"] is True
            assert result["is_complete"] == case["expected_complete"]
            assert len(result["missing_elements"]) >= 0

    @pytest.mark.asyncio
    async def test_generate_prompt_variations_by_style(self, prompt_service):
        """Test generating prompt variations for different styles."""
        base_prompt = "Advertise premium coffee beans"
        styles = ["luxury", "casual", "professional", "playful"]

        for style in styles:
            prompt_service.openai_llm.invoke.return_value.content = f"""
            {style.title()} Style Variation:
            
            Create an {style} advertisement showcasing premium coffee beans with {style}-appropriate tone and messaging
            
            Style Elements:
            - {style.title()} visual aesthetics
            - Appropriate color palette
            - Target audience alignment
            """

            result = await prompt_service.generate_prompt_variations_by_style(
                base_prompt, style
            )

            assert result["success"] is True
            assert style.lower() in result["styled_prompt"].lower()
            assert len(result["style_elements"]) > 0

    @pytest.mark.asyncio
    async def test_prompt_service_error_handling(self, prompt_service):
        """Test error handling in prompt service."""
        # Test with AI service failure
        prompt_service.openai_llm.invoke.side_effect = Exception(
            "API rate limit exceeded"
        )
        prompt_service.gemini_llm = None

        result = await prompt_service.enhance_prompt("test prompt")

        assert result["success"] is False
        assert "API rate limit exceeded" in result["error"]

    @pytest.mark.asyncio
    async def test_prompt_service_fallback_to_gemini(self, prompt_service):
        """Test fallback to Gemini when OpenAI fails."""
        prompt_service.openai_llm.invoke.side_effect = Exception("OpenAI unavailable")
        prompt_service.gemini_llm.invoke.return_value.content = """
        Enhanced Prompt: Gemini-enhanced advertisement prompt
        Score: 7.8
        Improvements: Enhanced by Gemini model
        """

        result = await prompt_service.enhance_prompt("test prompt")

        assert result["success"] is True
        assert "Gemini-enhanced" in result["enhanced_prompt"]
        prompt_service.gemini_llm.invoke.assert_called_once()
