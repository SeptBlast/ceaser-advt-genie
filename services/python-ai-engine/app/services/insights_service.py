import os
from typing import Dict, List, Any, Optional
import structlog
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from datetime import datetime, timedelta
import json

logger = structlog.get_logger()


class InsightsService:
    """
    Service for generating AI-powered insights and strategic recommendations.
    Combines data analysis with predictive insights and strategic planning.
    """

    def __init__(self):
        self.llm = self._init_llm()
        self.insight_prompts = {
            "performance": self._get_performance_insights_prompt(),
            "predictive": self._get_predictive_insights_prompt(),
            "strategic": self._get_strategic_insights_prompt(),
            "competitive": self._get_competitive_insights_prompt(),
            "seasonal": self._get_seasonal_insights_prompt(),
            "budget": self._get_budget_insights_prompt(),
            "audience": self._get_audience_insights_prompt(),
        }
        logger.info("InsightsService initialized")

    def _init_llm(self) -> Optional[ChatOpenAI]:
        """Initialize LLM for insights generation"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            return ChatOpenAI(
                api_key=api_key,
                model="gpt-4o",
                temperature=0.4,  # Balanced creativity and consistency
                max_tokens=3000,
            )

        google_key = os.getenv("GOOGLE_API_KEY")
        if google_key:
            return ChatGoogleGenerativeAI(
                model="gemini-1.5-pro",
                google_api_key=google_key,
                temperature=0.4,
                max_output_tokens=3000,
            )
        return None

    def _get_performance_insights_prompt(self) -> PromptTemplate:
        """Prompt for performance insights"""
        template = """
        As an expert marketing performance analyst, generate actionable insights from the following data:

        Campaign ID: {campaign_id}
        Time Range: {time_range}
        Performance Data: {performance_data}
        Historical Context: {historical_context}

        Generate performance insights including:

        1. **Key Performance Trends:**
           - Identify significant performance patterns
           - Highlight improving and declining metrics
           - Seasonal or cyclical patterns

        2. **Performance Drivers:**
           - What's driving strong performance?
           - What factors are limiting performance?
           - External influences on performance

        3. **Efficiency Analysis:**
           - Cost efficiency trends
           - ROI optimization opportunities
           - Resource allocation insights

        4. **Risk Assessment:**
           - Performance risks to monitor
           - Early warning indicators
           - Mitigation strategies

        5. **Opportunity Identification:**
           - Untapped performance potential
           - Scaling opportunities
           - Quick win possibilities

        For each insight, provide:
        - Specific data points supporting the insight
        - Confidence level (0-100%)
        - Recommended actions
        - Expected impact

        Format as structured insights with clear priorities.
        """
        return PromptTemplate(
            input_variables=[
                "campaign_id",
                "time_range",
                "performance_data",
                "historical_context",
            ],
            template=template,
        )

    def _get_predictive_insights_prompt(self) -> PromptTemplate:
        """Prompt for predictive insights"""
        template = """
        As a predictive analytics expert, analyze the following data to forecast future performance:

        Campaign ID: {campaign_id}
        Historical Data: {historical_data}
        Market Trends: {market_trends}
        Seasonal Factors: {seasonal_factors}

        Generate predictive insights including:

        1. **Performance Forecasts:**
           - 30-day performance predictions
           - 90-day trend forecasts
           - Seasonal performance expectations

        2. **Risk Predictions:**
           - Potential performance risks
           - Market disruption scenarios
           - Competitive threat assessment

        3. **Opportunity Forecasts:**
           - Emerging market opportunities
           - Growth potential scenarios
           - Scaling recommendations

        4. **Budget Planning:**
           - Optimal budget allocation predictions
           - ROI forecasts by channel
           - Investment recommendations

        5. **Strategic Timing:**
           - Best timing for campaign launches
           - Optimal bid adjustment periods
           - Creative refresh timing

        Include confidence intervals and scenario planning for each prediction.
        """
        return PromptTemplate(
            input_variables=[
                "campaign_id",
                "historical_data",
                "market_trends",
                "seasonal_factors",
            ],
            template=template,
        )

    def _get_strategic_insights_prompt(self) -> PromptTemplate:
        """Prompt for strategic insights"""
        template = """
        As a strategic marketing advisor, provide high-level strategic insights:

        Campaign Context: {campaign_context}
        Business Goals: {business_goals}
        Market Position: {market_position}
        Competitive Landscape: {competitive_data}

        Generate strategic insights including:

        1. **Strategic Positioning:**
           - Market positioning opportunities
           - Competitive differentiation strategies
           - Brand positioning recommendations

        2. **Growth Strategy:**
           - Sustainable growth approaches
           - Market expansion opportunities
           - Channel diversification strategies

        3. **Investment Priorities:**
           - High-impact investment areas
           - Resource allocation strategy
           - Technology and tool investments

        4. **Long-term Planning:**
           - 6-12 month strategic roadmap
           - Capability building needs
           - Market trend preparation

        5. **Risk Management:**
           - Strategic risks assessment
           - Contingency planning
           - Portfolio diversification

        Focus on long-term value creation and sustainable competitive advantage.
        """
        return PromptTemplate(
            input_variables=[
                "campaign_context",
                "business_goals",
                "market_position",
                "competitive_data",
            ],
            template=template,
        )

    def _get_competitive_insights_prompt(self) -> PromptTemplate:
        """Prompt for competitive insights"""
        template = """
        As a competitive intelligence analyst, analyze the competitive landscape:

        Industry: {industry}
        Competitive Data: {competitive_data}
        Market Share: {market_share_data}
        Competitive Performance: {competitive_performance}

        Generate competitive insights including:

        1. **Competitive Analysis:**
           - Key competitor strategies
           - Market share dynamics
           - Competitive strengths/weaknesses

        2. **Market Opportunities:**
           - Gaps in competitive coverage
           - Underserved market segments
           - Emerging competitive threats

        3. **Strategic Responses:**
           - Defensive strategies
           - Offensive opportunities
           - Differentiation tactics

        4. **Monitoring Framework:**
           - Key metrics to track
           - Competitive early warning signals
           - Intelligence gathering priorities

        Provide actionable competitive intelligence with strategic implications.
        """
        return PromptTemplate(
            input_variables=[
                "industry",
                "competitive_data",
                "market_share_data",
                "competitive_performance",
            ],
            template=template,
        )

    def _get_seasonal_insights_prompt(self) -> PromptTemplate:
        """Prompt for seasonal insights"""
        template = """
        As a seasonal marketing expert, analyze seasonal patterns and opportunities:

        Campaign Data: {campaign_data}
        Seasonal History: {seasonal_history}
        Industry Seasonality: {industry_patterns}
        Current Season: {current_season}

        Generate seasonal insights including:

        1. **Seasonal Performance Patterns:**
           - Historical seasonal trends
           - Peak and low performance periods
           - Seasonal conversion patterns

        2. **Seasonal Opportunities:**
           - Upcoming seasonal moments
           - Holiday marketing opportunities
           - Event-driven campaigns

        3. **Seasonal Adjustments:**
           - Budget reallocation recommendations
           - Creative seasonal adaptations
           - Targeting adjustments

        4. **Preparation Strategies:**
           - Seasonal campaign planning
           - Inventory and capacity planning
           - Competitive seasonal positioning

        Focus on maximizing seasonal opportunities while maintaining year-round performance.
        """
        return PromptTemplate(
            input_variables=[
                "campaign_data",
                "seasonal_history",
                "industry_patterns",
                "current_season",
            ],
            template=template,
        )

    def _get_budget_insights_prompt(self) -> PromptTemplate:
        """Prompt for budget insights"""
        template = """
        As a budget optimization expert, analyze spending efficiency and allocation:

        Current Budget: {current_budget}
        Spend Analysis: {spend_data}
        Performance by Channel: {channel_performance}
        ROI Data: {roi_data}

        Generate budget insights including:

        1. **Spend Efficiency:**
           - Cost per acquisition trends
           - ROI by channel and campaign
           - Budget utilization analysis

        2. **Allocation Optimization:**
           - Optimal budget distribution
           - Underperforming spend areas
           - High-opportunity channels

        3. **Budget Scaling:**
           - Safe scaling opportunities
           - Diminishing returns thresholds
           - Investment prioritization

        4. **Cost Management:**
           - Cost reduction opportunities
           - Efficiency improvements
           - Waste elimination

        Provide specific budget reallocation recommendations with expected impact.
        """
        return PromptTemplate(
            input_variables=[
                "current_budget",
                "spend_data",
                "channel_performance",
                "roi_data",
            ],
            template=template,
        )

    def _get_audience_insights_prompt(self) -> PromptTemplate:
        """Prompt for audience insights"""
        template = """
        As an audience strategy expert, analyze audience behavior and opportunities:

        Audience Data: {audience_data}
        Behavioral Patterns: {behavioral_data}
        Conversion Paths: {conversion_data}
        Segment Performance: {segment_performance}

        Generate audience insights including:

        1. **Audience Segmentation:**
           - High-value audience segments
           - Behavioral cohort analysis
           - Lifecycle stage insights

        2. **Targeting Optimization:**
           - Audience expansion opportunities
           - Targeting refinement recommendations
           - Lookalike audience potential

        3. **Personalization Opportunities:**
           - Message personalization strategies
           - Dynamic creative opportunities
           - Channel preference insights

        4. **Retention and Growth:**
           - Audience retention strategies
           - Cross-sell and upsell opportunities
           - Lifetime value optimization

        Focus on maximizing audience value and sustainable growth.
        """
        return PromptTemplate(
            input_variables=[
                "audience_data",
                "behavioral_data",
                "conversion_data",
                "segment_performance",
            ],
            template=template,
        )

    async def generate_insights(
        self,
        campaign_id: str,
        insight_type: str,
        time_range: str,
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate AI-powered insights and recommendations.
        Leverages advanced LangChain capabilities for deep analysis.
        """
        try:
            logger.info(
                "Starting insights generation",
                campaign_id=campaign_id,
                insight_type=insight_type,
                time_range=time_range,
            )

            if not self.llm:
                raise ValueError("No LLM available for insights generation")

            if insight_type not in self.insight_prompts:
                raise ValueError(f"Unsupported insight type: {insight_type}")

            # Fetch relevant data for insights
            insight_data = await self._fetch_insight_data(
                campaign_id, insight_type, time_range, parameters
            )

            # Get appropriate prompt
            prompt_template = self.insight_prompts[insight_type]

            # Create insights chain
            insights_chain = LLMChain(
                llm=self.llm, prompt=prompt_template, verbose=True
            )

            # Prepare input variables based on insight type
            input_vars = self._prepare_insight_inputs(
                insight_type, insight_data, campaign_id, time_range, parameters
            )

            # Generate insights
            insights_result = await insights_chain.arun(**input_vars)

            # Parse and structure insights
            structured_insights = await self._structure_insights(
                insights_result, insight_type
            )

            response = {
                "success": True,
                "message": f"Generated {insight_type} insights successfully",
                "insights": structured_insights,
                "summary": self._generate_insights_summary(structured_insights),
                "metadata": {
                    "insight_type": insight_type,
                    "time_range": time_range,
                    "generated_at": datetime.utcnow().isoformat(),
                    "data_points_analyzed": len(insight_data),
                    "confidence_level": "high",
                },
            }

            logger.info(
                "Insights generation completed successfully",
                campaign_id=campaign_id,
                insight_type=insight_type,
                insights_count=len(structured_insights),
            )

            return response

        except Exception as e:
            logger.error(
                "Insights generation failed",
                error=str(e),
                campaign_id=campaign_id,
                insight_type=insight_type,
            )
            return {
                "success": False,
                "message": f"Insights generation failed: {str(e)}",
                "insights": [],
                "summary": "",
                "metadata": {
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat(),
                },
            }

    async def _fetch_insight_data(
        self,
        campaign_id: str,
        insight_type: str,
        time_range: str,
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Fetch relevant data for insights generation"""
        # Simulate fetching comprehensive data (replace with actual data sources)
        base_data = {
            "performance_metrics": {
                "impressions": 250000,
                "clicks": 6500,
                "conversions": 385,
                "spend": 8250.00,
                "ctr": 2.6,
                "conversion_rate": 5.9,
                "roas": 4.8,
            },
            "trends": {
                "ctr_trend": "+12% vs last period",
                "conversion_trend": "-3% vs last period",
                "cost_trend": "+8% vs last period",
            },
            "audience_data": {
                "top_segments": ["tech_professionals", "small_business_owners"],
                "engagement_patterns": "Peak engagement 7-9 PM weekdays",
                "conversion_patterns": "Higher weekend conversion rates",
            },
            "competitive_data": {
                "market_share": "12%",
                "competitive_position": "Strong in mobile, weak in desktop",
                "opportunity_areas": ["video advertising", "lookalike targeting"],
            },
        }

        return base_data

    def _prepare_insight_inputs(
        self,
        insight_type: str,
        data: Dict[str, Any],
        campaign_id: str,
        time_range: str,
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Prepare input variables for specific insight types"""
        if insight_type == "performance":
            return {
                "campaign_id": campaign_id,
                "time_range": time_range,
                "performance_data": json.dumps(data["performance_metrics"], indent=2),
                "historical_context": json.dumps(data["trends"], indent=2),
            }
        elif insight_type == "predictive":
            return {
                "campaign_id": campaign_id,
                "historical_data": json.dumps(data["performance_metrics"], indent=2),
                "market_trends": json.dumps(data["trends"], indent=2),
                "seasonal_factors": json.dumps(
                    parameters.get("seasonal", {}), indent=2
                ),
            }
        elif insight_type == "audience":
            return {
                "audience_data": json.dumps(data["audience_data"], indent=2),
                "behavioral_data": json.dumps(data["audience_data"], indent=2),
                "conversion_data": json.dumps(data["performance_metrics"], indent=2),
                "segment_performance": json.dumps(data["trends"], indent=2),
            }
        else:
            # Default structure
            return {
                "campaign_id": campaign_id,
                "data": json.dumps(data, indent=2),
                "time_range": time_range,
                "parameters": json.dumps(parameters, indent=2),
            }

    async def _structure_insights(
        self, insights_text: str, insight_type: str
    ) -> List[Dict[str, Any]]:
        """Structure the generated insights into a standardized format"""
        # In production, this could use NLP to extract structured insights
        # For now, create sample structured insights
        insights = [
            {
                "insight_id": f"insight_{insight_type}_001",
                "title": "Performance Optimization Opportunity",
                "description": "Mobile traffic shows 35% higher engagement rates compared to desktop",
                "category": "optimization",
                "confidence_score": 0.87,
                "data_points": {
                    "mobile_ctr": "3.2%",
                    "desktop_ctr": "2.1%",
                    "mobile_conversion_rate": "6.8%",
                },
                "recommendations": [
                    "Increase mobile budget allocation by 25%",
                    "Develop mobile-specific creative variations",
                    "Implement mobile-optimized landing pages",
                ],
                "impact_estimate": "15-20% improvement in overall performance",
                "priority": "high",
            },
            {
                "insight_id": f"insight_{insight_type}_002",
                "title": "Audience Expansion Opportunity",
                "description": "Similar audience segments show untapped potential for growth",
                "category": "growth",
                "confidence_score": 0.73,
                "data_points": {
                    "lookalike_match_rate": "92%",
                    "expansion_potential": "40% audience increase",
                },
                "recommendations": [
                    "Test lookalike audiences based on top converters",
                    "Expand geographic targeting to similar markets",
                    "Test interest-based audience expansion",
                ],
                "impact_estimate": "25-30% increase in qualified traffic",
                "priority": "medium",
            },
        ]

        return insights

    def _generate_insights_summary(self, insights: List[Dict[str, Any]]) -> str:
        """Generate a summary of key insights"""
        if not insights:
            return "No significant insights generated"

        high_priority_count = len([i for i in insights if i.get("priority") == "high"])
        total_insights = len(insights)

        summary = f"Generated {total_insights} insights with {high_priority_count} high-priority recommendations. "
        summary += "Key opportunities include performance optimization and audience expansion strategies."

        return summary
