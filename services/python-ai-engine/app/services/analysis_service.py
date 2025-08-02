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


class AnalysisService:
    """
    Service for AI-powered campaign analysis and performance evaluation.
    Uses advanced LangChain capabilities for data interpretation and insights.
    """
    
    def __init__(self):
        self.llm = self._init_llm()
        self.analysis_prompts = {
            "performance": self._get_performance_analysis_prompt(),
            "audience": self._get_audience_analysis_prompt(),
            "creative": self._get_creative_analysis_prompt(),
            "competitive": self._get_competitive_analysis_prompt(),
            "optimization": self._get_optimization_analysis_prompt()
        }
        logger.info("AnalysisService initialized")

    def _init_llm(self) -> Optional[ChatOpenAI]:
        """Initialize LLM for analysis"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            return ChatOpenAI(
                api_key=api_key,
                model="gpt-4o",  # Use more capable model for analysis
                temperature=0.3,  # Lower temperature for more consistent analysis
                max_tokens=3000
            )
        # Fallback to Gemini if available
        google_key = os.getenv("GOOGLE_API_KEY")
        if google_key:
            return ChatGoogleGenerativeAI(
                model="gemini-1.5-pro",
                google_api_key=google_key,
                temperature=0.3,
                max_output_tokens=3000
            )
        return None

    def _get_performance_analysis_prompt(self) -> PromptTemplate:
        """Prompt for performance analysis"""
        template = """
        As an expert digital marketing analyst, analyze the following campaign performance data:

        Campaign ID: {campaign_id}
        Analysis Period: {time_period}
        Metrics Data: {metrics_data}
        Campaign Context: {campaign_context}
        
        Filters Applied: {filters}

        Provide a comprehensive performance analysis including:

        1. **Key Performance Indicators Analysis:**
           - CTR trends and benchmarking
           - Conversion rate analysis
           - ROAS evaluation
           - Cost efficiency metrics

        2. **Performance Trends:**
           - Time-based performance patterns
           - Peak performance periods
           - Declining metrics identification

        3. **Audience Insights:**
           - Best performing audience segments
           - Demographic breakdowns
           - Behavioral patterns

        4. **Channel Performance:**
           - Platform-wise performance comparison
           - Cross-channel attribution analysis

        5. **Actionable Recommendations:**
           - Immediate optimization opportunities
           - Budget reallocation suggestions
           - Creative refresh recommendations
           - Targeting adjustments

        6. **Predictive Insights:**
           - Forecasted performance trends
           - Risk factors identification
           - Growth opportunities

        Format your response as a structured analysis with clear sections and actionable insights.
        Include confidence scores for your recommendations (0-100%).
        """
        return PromptTemplate(
            input_variables=["campaign_id", "time_period", "metrics_data", "campaign_context", "filters"],
            template=template
        )

    def _get_audience_analysis_prompt(self) -> PromptTemplate:
        """Prompt for audience analysis"""
        template = """
        As an expert audience analyst, analyze the following campaign audience data:

        Campaign ID: {campaign_id}
        Audience Data: {audience_data}
        Performance Metrics: {performance_metrics}
        Campaign Context: {campaign_context}

        Provide a detailed audience analysis including:

        1. **Audience Segmentation:**
           - High-performing audience segments
           - Underperforming segments
           - Demographic patterns

        2. **Behavioral Analysis:**
           - Engagement patterns
           - Conversion paths
           - Time-based behavior

        3. **Lookalike Opportunities:**
           - Similar audience identification
           - Expansion recommendations
           - Targeting refinement

        4. **Personalization Insights:**
           - Content preferences by segment
           - Messaging optimization
           - Creative customization

        Provide actionable recommendations with confidence scores.
        """
        return PromptTemplate(
            input_variables=["campaign_id", "audience_data", "performance_metrics", "campaign_context"],
            template=template
        )

    def _get_creative_analysis_prompt(self) -> PromptTemplate:
        """Prompt for creative analysis"""
        template = """
        As an expert creative analyst, analyze the following creative performance data:

        Campaign ID: {campaign_id}
        Creative Data: {creative_data}
        Performance Metrics: {performance_metrics}
        A/B Test Results: {ab_test_data}

        Provide a comprehensive creative analysis including:

        1. **Creative Performance Ranking:**
           - Best performing creatives
           - Performance drivers identification
           - Creative fatigue analysis

        2. **Element Analysis:**
           - Visual elements impact
           - Copy performance
           - CTA effectiveness

        3. **A/B Testing Insights:**
           - Statistical significance
           - Winner identification
           - Performance lift analysis

        4. **Creative Optimization:**
           - Refresh recommendations
           - New creative directions
           - Testing strategies

        Include confidence scores and statistical significance levels.
        """
        return PromptTemplate(
            input_variables=["campaign_id", "creative_data", "performance_metrics", "ab_test_data"],
            template=template
        )

    def _get_competitive_analysis_prompt(self) -> PromptTemplate:
        """Prompt for competitive analysis"""
        template = """
        As a competitive intelligence analyst, analyze the market landscape:

        Campaign ID: {campaign_id}
        Industry: {industry}
        Competitive Data: {competitive_data}
        Market Trends: {market_trends}

        Provide competitive analysis including:

        1. **Market Position:**
           - Competitive landscape
           - Market share insights
           - Positioning analysis

        2. **Competitive Strategies:**
           - Competitor creative strategies
           - Pricing analysis
           - Channel usage patterns

        3. **Opportunities:**
           - Market gaps
           - Competitive advantages
           - Threat mitigation

        4. **Strategic Recommendations:**
           - Differentiation strategies
           - Competitive responses
           - Market opportunities

        Focus on actionable intelligence with confidence assessments.
        """
        return PromptTemplate(
            input_variables=["campaign_id", "industry", "competitive_data", "market_trends"],
            template=template
        )

    def _get_optimization_analysis_prompt(self) -> PromptTemplate:
        """Prompt for optimization analysis"""
        template = """
        As an optimization specialist, analyze campaign performance for improvement opportunities:

        Campaign ID: {campaign_id}
        Current Performance: {current_performance}
        Historical Data: {historical_data}
        Optimization Goals: {optimization_goals}

        Provide optimization analysis including:

        1. **Performance Gaps:**
           - Underperforming areas
           - Benchmark comparisons
           - Opportunity sizing

        2. **Optimization Priorities:**
           - High-impact improvements
           - Quick wins identification
           - Long-term strategies

        3. **Testing Roadmap:**
           - A/B testing priorities
           - Multivariate testing opportunities
           - Testing timeline

        4. **Implementation Plan:**
           - Step-by-step optimization
           - Resource requirements
           - Expected outcomes

        Prioritize recommendations by impact and effort required.
        """
        return PromptTemplate(
            input_variables=["campaign_id", "current_performance", "historical_data", "optimization_goals"],
            template=template
        )

    async def analyze_campaign(
        self,
        campaign_id: str,
        metrics: List[str],
        analysis_type: str,
        filters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Perform comprehensive campaign analysis using AI models.
        Leverages Python's advanced analytics capabilities.
        """
        try:
            logger.info("Starting campaign analysis",
                       campaign_id=campaign_id,
                       analysis_type=analysis_type,
                       metrics=metrics)

            if not self.llm:
                raise ValueError("No LLM available for analysis")

            if analysis_type not in self.analysis_prompts:
                raise ValueError(f"Unsupported analysis type: {analysis_type}")

            # Simulate fetching campaign data (in real implementation, this would connect to databases)
            campaign_data = await self._fetch_campaign_data(campaign_id, metrics, filters)
            
            # Get appropriate prompt
            prompt_template = self.analysis_prompts[analysis_type]
            
            # Create analysis chain
            analysis_chain = LLMChain(llm=self.llm, prompt=prompt_template, verbose=True)

            # Prepare input based on analysis type
            if analysis_type == "performance":
                input_vars = {
                    "campaign_id": campaign_id,
                    "time_period": filters.get("time_period", "last_30_days"),
                    "metrics_data": json.dumps(campaign_data["metrics"], indent=2),
                    "campaign_context": json.dumps(campaign_data["context"], indent=2),
                    "filters": json.dumps(filters, indent=2)
                }
            elif analysis_type == "audience":
                input_vars = {
                    "campaign_id": campaign_id,
                    "audience_data": json.dumps(campaign_data["audience"], indent=2),
                    "performance_metrics": json.dumps(campaign_data["metrics"], indent=2),
                    "campaign_context": json.dumps(campaign_data["context"], indent=2)
                }
            elif analysis_type == "creative":
                input_vars = {
                    "campaign_id": campaign_id,
                    "creative_data": json.dumps(campaign_data["creatives"], indent=2),
                    "performance_metrics": json.dumps(campaign_data["metrics"], indent=2),
                    "ab_test_data": json.dumps(campaign_data.get("ab_tests", {}), indent=2)
                }
            else:
                # Default input structure
                input_vars = {
                    "campaign_id": campaign_id,
                    "current_performance": json.dumps(campaign_data["metrics"], indent=2),
                    "historical_data": json.dumps(campaign_data.get("historical", {}), indent=2),
                    "optimization_goals": json.dumps(filters.get("goals", {}), indent=2)
                }

            # Execute analysis
            analysis_result = await analysis_chain.arun(**input_vars)

            # Generate recommendations
            recommendations = await self._generate_recommendations(campaign_id, analysis_type, analysis_result)

            response = {
                "success": True,
                "message": f"Campaign analysis completed for {analysis_type}",
                "analysis": {
                    "analysis_id": f"analysis_{campaign_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    "summary": analysis_result[:500] + "..." if len(analysis_result) > 500 else analysis_result,
                    "full_analysis": analysis_result,
                    "metrics": campaign_data["metrics"],
                    "insights": [
                        "Performance is trending upward in the last 7 days",
                        "Mobile traffic shows higher engagement rates",
                        "Creative fatigue detected in primary ad set"
                    ],
                    "confidence_score": "85%"
                },
                "recommendations": recommendations
            }

            logger.info("Campaign analysis completed successfully",
                       campaign_id=campaign_id,
                       analysis_type=analysis_type)

            return response

        except Exception as e:
            logger.error("Campaign analysis failed",
                        error=str(e),
                        campaign_id=campaign_id,
                        analysis_type=analysis_type)
            return {
                "success": False,
                "message": f"Analysis failed: {str(e)}",
                "analysis": {},
                "recommendations": []
            }

    async def _fetch_campaign_data(self, campaign_id: str, metrics: List[str], filters: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate fetching campaign data (replace with actual database queries)"""
        # In production, this would fetch real data from MongoDB, analytics APIs, etc.
        return {
            "metrics": {
                "impressions": 125000,
                "clicks": 3250,
                "ctr": 2.6,
                "conversions": 185,
                "conversion_rate": 5.69,
                "cost_per_click": 1.25,
                "roas": 4.2,
                "spend": 4062.50
            },
            "context": {
                "campaign_name": "Q4 Product Launch",
                "platforms": ["facebook", "google_ads"],
                "target_audience": {"age": "25-45", "interests": ["technology"]},
                "duration_days": 14
            },
            "audience": {
                "segments": {
                    "tech_professionals": {"performance": 8.2, "volume": 45000},
                    "young_professionals": {"performance": 6.8, "volume": 32000}
                }
            },
            "creatives": {
                "video_001": {"ctr": 3.2, "impressions": 45000},
                "image_002": {"ctr": 2.1, "impressions": 38000}
            }
        }

    async def _generate_recommendations(self, campaign_id: str, analysis_type: str, analysis: str) -> List[Dict[str, Any]]:
        """Generate actionable recommendations based on analysis"""
        # In production, this could use another LLM call to extract specific recommendations
        base_recommendations = [
            {
                "recommendation_id": f"rec_{campaign_id}_001",
                "title": "Increase Mobile Budget Allocation",
                "description": "Mobile traffic shows 35% higher engagement. Consider reallocating 20% more budget to mobile placements.",
                "priority": "high",
                "impact_score": 8.5,
                "action_items": [
                    "Analyze mobile vs desktop performance",
                    "Test mobile-optimized creative variations",
                    "Adjust bid modifiers for mobile traffic"
                ]
            },
            {
                "recommendation_id": f"rec_{campaign_id}_002",
                "title": "Creative Refresh Required",
                "description": "Primary creative showing signs of fatigue with declining CTR over past 7 days.",
                "priority": "medium",
                "impact_score": 7.2,
                "action_items": [
                    "Develop new creative concepts",
                    "A/B test fresh visual elements",
                    "Implement dynamic creative optimization"
                ]
            }
        ]
        
        return base_recommendations
