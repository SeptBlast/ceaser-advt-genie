"""
Unit tests for AgentService class.
Tests workflow execution, task coordination, and state management.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
import asyncio
from datetime import datetime

from app.services.agent_service import AgentService


class TestAgentService:
    """Test suite for AgentService class."""

    @pytest.fixture
    def agent_service(self, mock_openai_llm, mock_gemini_llm):
        """Create AgentService instance with mocked dependencies."""
        with patch(
            "app.services.agent_service.ChatOpenAI", return_value=mock_openai_llm
        ):
            with patch(
                "app.services.agent_service.ChatGoogleGenerativeAI",
                return_value=mock_gemini_llm,
            ):
                service = AgentService()
                service.openai_llm = mock_openai_llm
                service.gemini_llm = mock_gemini_llm
                return service

    @pytest.fixture
    def sample_workflow_request(self):
        """Sample workflow request for testing."""
        return {
            "workflow_type": "campaign_optimization",
            "input_data": {
                "campaign_id": "camp_123",
                "current_performance": {"ctr": 0.02, "cpc": 1.50, "conversions": 25},
                "optimization_goals": ["increase_ctr", "reduce_cpc"],
            },
            "configuration": {"analysis_period": "30d", "confidence_threshold": 0.85},
        }

    @pytest.mark.asyncio
    async def test_execute_workflow_campaign_optimization(
        self, agent_service, sample_workflow_request
    ):
        """Test campaign optimization workflow execution."""
        agent_service.openai_llm.invoke.return_value.content = """
        Analysis Complete:
        
        Current Performance Analysis:
        - CTR: 2% (below industry average of 3.5%)
        - CPC: $1.50 (within acceptable range)
        - Conversion Rate: Low volume suggests targeting issues
        
        Recommendations:
        1. Refine audience targeting to high-intent users
        2. A/B test ad creative variations focusing on emotional appeal
        3. Optimize ad placement for premium inventory
        4. Implement dynamic bidding strategies
        
        Expected Improvements:
        - CTR increase: +45% (to 2.9%)
        - CPC reduction: -20% (to $1.20)
        - Conversion increase: +60%
        
        Confidence Score: 0.87
        """

        result = await agent_service.execute_workflow(sample_workflow_request)

        assert result["success"] is True
        assert result["workflow_type"] == "campaign_optimization"
        assert "recommendations" in result
        assert len(result["recommendations"]) > 0
        assert result["confidence_score"] > 0.8
        assert "expected_improvements" in result

    @pytest.mark.asyncio
    async def test_execute_workflow_creative_generation(self, agent_service):
        """Test creative generation workflow execution."""
        creative_request = {
            "workflow_type": "creative_generation",
            "input_data": {
                "brand": "EcoClean",
                "product": "Natural Laundry Detergent",
                "target_audience": "environmentally conscious families",
                "creative_types": ["video", "image", "text"],
            },
            "configuration": {
                "num_variants": 3,
                "style_preferences": ["clean", "family-friendly"],
            },
        }

        agent_service.openai_llm.invoke.return_value.content = """
        Creative Generation Complete:
        
        Generated Assets:
        
        Video Creative:
        - 30-second family scene showcasing natural cleaning power
        - Emphasis on child safety and environmental benefits
        - Warm, home-like atmosphere with natural lighting
        
        Image Creative:
        - Product hero shot with natural elements (leaves, bubbles)
        - Clean, minimalist design with eco-friendly color palette
        - Trust badges highlighting natural ingredients
        
        Text Creative:
        - Headline: "Clean Clothes, Clean Conscience"
        - Body: "EcoClean's plant-based formula delivers powerful cleaning while protecting your family and the planet"
        - CTA: "Try EcoClean Risk-Free Today"
        
        Performance Prediction: High engagement expected across all formats
        """

        result = await agent_service.execute_workflow(creative_request)

        assert result["success"] is True
        assert "generated_assets" in result
        assert len(result["generated_assets"]) >= 3
        assert any(
            "video" in asset["type"].lower() for asset in result["generated_assets"]
        )

    @pytest.mark.asyncio
    async def test_execute_workflow_audience_analysis(self, agent_service):
        """Test audience analysis workflow execution."""
        audience_request = {
            "workflow_type": "audience_analysis",
            "input_data": {
                "campaign_data": {
                    "impressions": 100000,
                    "clicks": 2500,
                    "conversions": 125,
                },
                "demographic_data": {
                    "age_groups": {
                        "18-24": 0.2,
                        "25-34": 0.4,
                        "35-44": 0.3,
                        "45+": 0.1,
                    },
                    "locations": {"urban": 0.6, "suburban": 0.3, "rural": 0.1},
                },
            },
        }

        agent_service.openai_llm.invoke.return_value.content = """
        Audience Analysis Results:
        
        High-Performing Segments:
        1. Urban professionals aged 25-34 (40% of conversions)
        2. Suburban families aged 35-44 (35% of conversions)
        
        Underperforming Segments:
        1. Young adults 18-24 (high impressions, low conversions)
        2. Rural demographics (limited reach)
        
        Recommendations:
        - Increase budget allocation to urban 25-34 segment
        - Create family-focused creative for suburban 35-44 segment
        - Reduce spend on 18-24 segment or adjust messaging
        - Consider geo-targeting improvements for rural areas
        
        Lookalike Expansion Opportunities:
        - Similar urban professionals in adjacent metro areas
        - Suburban families with similar household income profiles
        """

        result = await agent_service.execute_workflow(audience_request)

        assert result["success"] is True
        assert "high_performing_segments" in result
        assert "recommendations" in result
        assert "expansion_opportunities" in result
        assert len(result["high_performing_segments"]) >= 2

    @pytest.mark.asyncio
    async def test_execute_workflow_competitive_analysis(self, agent_service):
        """Test competitive analysis workflow execution."""
        competitive_request = {
            "workflow_type": "competitive_analysis",
            "input_data": {
                "industry": "fitness apps",
                "competitors": ["MyFitnessPal", "Strava", "Nike Training"],
                "analysis_focus": [
                    "messaging",
                    "creative_strategy",
                    "audience_targeting",
                ],
            },
        }

        agent_service.openai_llm.invoke.return_value.content = """
        Competitive Analysis Summary:
        
        Messaging Analysis:
        - MyFitnessPal: Focus on calorie tracking and community support
        - Strava: Emphasis on athletic performance and social competition  
        - Nike Training: Premium brand positioning with celebrity endorsements
        
        Creative Strategy Patterns:
        - High use of user-generated content and real transformation stories
        - Video testimonials with before/after comparisons
        - Mobile-first creative formats optimized for social platforms
        
        Audience Targeting Insights:
        - All competitors target 25-45 age group heavily
        - Strong focus on urban/suburban demographics
        - Interest-based targeting around health, fitness, lifestyle
        
        Opportunity Gaps:
        1. Underserved seniors market (45+)
        2. Beginner-friendly messaging not well addressed
        3. Mental health angle underutilized
        
        Strategic Recommendations:
        - Differentiate with beginner-focused, non-intimidating approach
        - Explore mental wellness positioning
        - Target underserved 45+ demographic
        """

        result = await agent_service.execute_workflow(competitive_request)

        assert result["success"] is True
        assert "messaging_analysis" in result
        assert "opportunity_gaps" in result
        assert "strategic_recommendations" in result
        assert len(result["opportunity_gaps"]) > 0

    @pytest.mark.asyncio
    async def test_workflow_state_management(
        self, agent_service, sample_workflow_request
    ):
        """Test workflow state tracking and management."""
        # Start workflow
        workflow_id = await agent_service.start_workflow(sample_workflow_request)

        assert workflow_id is not None
        assert len(workflow_id) > 0

        # Check initial state
        state = await agent_service.get_workflow_state(workflow_id)
        assert state["status"] == "running"
        assert state["progress"] == 0

        # Simulate workflow progress
        await agent_service.update_workflow_progress(
            workflow_id, 50, "Analyzing current performance"
        )

        updated_state = await agent_service.get_workflow_state(workflow_id)
        assert updated_state["progress"] == 50
        assert "Analyzing" in updated_state["current_step"]

    @pytest.mark.asyncio
    async def test_workflow_error_handling(self, agent_service):
        """Test workflow error handling and recovery."""
        error_request = {"workflow_type": "invalid_workflow", "input_data": {}}

        result = await agent_service.execute_workflow(error_request)

        assert result["success"] is False
        assert "error" in result
        assert "invalid_workflow" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_workflow_timeout_handling(
        self, agent_service, sample_workflow_request
    ):
        """Test workflow timeout handling."""
        # Set very short timeout
        sample_workflow_request["configuration"]["timeout"] = 0.1

        # Mock a slow LLM response
        async def slow_invoke(*args, **kwargs):
            await asyncio.sleep(0.2)  # Longer than timeout
            return Mock(content="Delayed response")

        agent_service.openai_llm.invoke = slow_invoke

        result = await agent_service.execute_workflow(sample_workflow_request)

        assert result["success"] is False
        assert "timeout" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_multi_step_workflow(self, agent_service):
        """Test complex multi-step workflow execution."""
        multi_step_request = {
            "workflow_type": "full_campaign_optimization",
            "input_data": {
                "campaign_id": "camp_456",
                "include_steps": [
                    "audience_analysis",
                    "creative_optimization",
                    "bid_strategy",
                ],
            },
        }

        # Mock responses for each step
        responses = [
            "Step 1: Audience Analysis Complete - Top segments identified",
            "Step 2: Creative Optimization Complete - 5 new variants generated",
            "Step 3: Bid Strategy Complete - Dynamic bidding recommendations provided",
        ]

        agent_service.openai_llm.invoke.side_effect = [
            Mock(content=response) for response in responses
        ]

        result = await agent_service.execute_workflow(multi_step_request)

        assert result["success"] is True
        assert "steps_completed" in result
        assert len(result["steps_completed"]) == 3

    @pytest.mark.asyncio
    async def test_workflow_with_external_data(self, agent_service):
        """Test workflow integration with external data sources."""
        external_data_request = {
            "workflow_type": "market_analysis",
            "input_data": {
                "industry": "e-commerce",
                "fetch_external_data": True,
                "data_sources": ["google_trends", "industry_reports"],
            },
        }

        # Mock external data fetching
        with patch("app.services.agent_service.fetch_google_trends") as mock_trends:
            with patch(
                "app.services.agent_service.fetch_industry_reports"
            ) as mock_reports:
                mock_trends.return_value = {
                    "trending_keywords": ["sustainable", "eco-friendly"]
                }
                mock_reports.return_value = {
                    "growth_rate": "15%",
                    "key_trends": ["mobile commerce"],
                }

                agent_service.openai_llm.invoke.return_value.content = """
                Market Analysis with External Data:
                
                Google Trends Insights:
                - "Sustainable" keyword trending up 45%
                - "Eco-friendly" searches increased 30%
                
                Industry Report Highlights:
                - E-commerce growth rate: 15% YoY
                - Mobile commerce dominates with 60% of transactions
                
                Strategic Recommendations:
                - Capitalize on sustainability trend in messaging
                - Prioritize mobile-optimized creative formats
                - Consider eco-friendly product positioning
                """

                result = await agent_service.execute_workflow(external_data_request)

                assert result["success"] is True
                assert "external_data_insights" in result
                assert "sustainable" in result["analysis"].lower()

    @pytest.mark.asyncio
    async def test_workflow_caching(self, agent_service, sample_workflow_request):
        """Test workflow result caching for performance."""
        # First execution
        agent_service.openai_llm.invoke.return_value.content = "Cached analysis result"

        result1 = await agent_service.execute_workflow(sample_workflow_request)

        # Second execution with same request should use cache
        result2 = await agent_service.execute_workflow(sample_workflow_request)

        assert result1 == result2
        # LLM should only be called once due to caching
        agent_service.openai_llm.invoke.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_workflow_history(self, agent_service):
        """Test retrieving workflow execution history."""
        user_id = "user_123"

        # Mock workflow history
        history = await agent_service.get_workflow_history(user_id, limit=10)

        assert isinstance(history, list)
        # History should be ordered by execution time (most recent first)
        if len(history) > 1:
            assert history[0]["executed_at"] >= history[1]["executed_at"]

    @pytest.mark.asyncio
    async def test_cancel_workflow(self, agent_service):
        """Test workflow cancellation."""
        workflow_id = "workflow_789"

        # Mock running workflow
        await agent_service.start_workflow(
            {"workflow_type": "long_running_analysis", "input_data": {}}
        )

        # Cancel the workflow
        result = await agent_service.cancel_workflow(workflow_id)

        assert result["success"] is True
        assert result["status"] == "cancelled"

        # Check workflow state
        state = await agent_service.get_workflow_state(workflow_id)
        assert state["status"] == "cancelled"
