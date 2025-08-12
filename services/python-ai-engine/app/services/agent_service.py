import os
from typing import Dict, List, Any, Optional
import structlog
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import Tool, DuckDuckGoSearchRun
from langchain.memory import ConversationBufferWindowMemory
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.tools.wikipedia.tool import WikipediaQueryRun
from langchain_community.utilities.wikipedia import WikipediaAPIWrapper
from datetime import datetime
import json

logger = structlog.get_logger()


class AgentService:
    """
    Service for executing complex agentic workflows using LangChain agents and tools.
    This showcases Python's strength in the AI ecosystem with extensive tool integrations.
    """

    def __init__(self):
        self.llm = self._init_llm()
        self.tools = self._init_tools()
        self.memory = ConversationBufferWindowMemory(
            memory_key="chat_history",
            return_messages=True,
            k=10,  # Remember last 10 interactions
        )

        # Agent prompt template
        self.agent_prompt = self._create_agent_prompt()

        logger.info(
            "AgentService initialized with tools",
            tools=[tool.name for tool in self.tools],
        )

    def _init_llm(self) -> Optional[ChatOpenAI]:
        """Initialize LLM for agent workflows"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            return ChatOpenAI(
                api_key=api_key,
                model="gpt-4o",  # Use function calling capable model
                temperature=0.1,  # Low temperature for more consistent tool usage
                max_tokens=2000,
            )
        # Note: Gemini could be used here too, but OpenAI has better function calling
        return None

    def _init_tools(self) -> List[Tool]:
        """Initialize available tools for the agent"""
        tools = []

        # Web search tool
        try:
            search_tool = DuckDuckGoSearchRun()
            tools.append(
                Tool(
                    name="web_search",
                    description="Search the web for current information, news, trends, and market data. Use this for competitive intelligence, market research, and trend analysis.",
                    func=search_tool.run,
                )
            )
        except Exception as e:
            logger.warning("Failed to initialize web search tool", error=str(e))

        # Wikipedia tool for background research
        try:
            wikipedia = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())
            tools.append(
                Tool(
                    name="wikipedia_search",
                    description="Search Wikipedia for general information about companies, products, people, or concepts. Good for background research.",
                    func=wikipedia.run,
                )
            )
        except Exception as e:
            logger.warning("Failed to initialize Wikipedia tool", error=str(e))

        # Campaign data analysis tool
        tools.append(
            Tool(
                name="campaign_analyzer",
                description="Analyze campaign performance data, metrics, and trends. Input should be a campaign ID or performance data.",
                func=self._analyze_campaign_data,
            )
        )

        # Market research tool
        tools.append(
            Tool(
                name="market_researcher",
                description="Research market trends, competitor analysis, and industry insights. Input should be industry or product category.",
                func=self._research_market_trends,
            )
        )

        # Creative optimization tool
        tools.append(
            Tool(
                name="creative_optimizer",
                description="Analyze creative performance and provide optimization recommendations. Input should be creative IDs or performance data.",
                func=self._optimize_creatives,
            )
        )

        # Audience insights tool
        tools.append(
            Tool(
                name="audience_insights",
                description="Analyze audience behavior, segments, and targeting opportunities. Input should be audience data or campaign targeting info.",
                func=self._analyze_audience_insights,
            )
        )

        # Budget optimization tool
        tools.append(
            Tool(
                name="budget_optimizer",
                description="Analyze budget allocation and provide optimization recommendations. Input should be current budget distribution and performance data.",
                func=self._optimize_budget_allocation,
            )
        )

        return tools

    def _create_agent_prompt(self) -> ChatPromptTemplate:
        """Create the agent system prompt"""
        system_prompt = """
        You are an expert AI marketing agent with access to powerful tools for campaign optimization and analysis.
        Your role is to help with complex marketing workflows, analysis, and strategic recommendations.

        Available Tools:
        - web_search: Search the web for current information and market trends
        - wikipedia_search: Research general information about companies and concepts
        - campaign_analyzer: Analyze campaign performance and metrics
        - market_researcher: Research market trends and competitive landscape
        - creative_optimizer: Analyze and optimize creative performance
        - audience_insights: Analyze audience behavior and targeting
        - budget_optimizer: Optimize budget allocation across channels

        Guidelines:
        1. Always use relevant tools to gather data before making recommendations
        2. Provide specific, actionable insights based on the data you collect
        3. When analyzing campaigns, look for trends, opportunities, and optimization potential
        4. Be thorough in your analysis but concise in your recommendations
        5. Always explain your reasoning and cite the data sources you used
        6. If you need more information, ask clarifying questions

        Current context: {context}
        """

        return ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
                MessagesPlaceholder("agent_scratchpad"),
            ]
        )

    async def execute_workflow(
        self,
        workflow_type: str,
        user_query: str,
        context: Dict[str, Any],
        available_tools: List[str],
        campaign_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Execute an agentic workflow using LangChain agents and tools.
        This showcases the power of Python's mature AI ecosystem.
        """
        try:
            logger.info(
                "Starting agent workflow",
                workflow_type=workflow_type,
                user_query=user_query,
                campaign_id=campaign_id,
            )

            if not self.llm:
                raise ValueError("No LLM available for agent workflows")

            # Filter tools based on available_tools if specified
            if available_tools:
                filtered_tools = [
                    tool for tool in self.tools if tool.name in available_tools
                ]
            else:
                filtered_tools = self.tools

            if not filtered_tools:
                logger.warning("No tools available for agent execution")
                filtered_tools = self.tools[:2]  # Use at least search tools

            # Create agent with filtered tools
            agent = create_openai_functions_agent(
                llm=self.llm, tools=filtered_tools, prompt=self.agent_prompt
            )

            # Create executor
            executor = AgentExecutor(
                agent=agent,
                tools=filtered_tools,
                memory=self.memory,
                verbose=True,
                max_iterations=5,
                handle_parsing_errors=True,
            )

            # Prepare context for the agent
            context_str = (
                json.dumps(context, indent=2)
                if context
                else "No additional context provided"
            )
            if campaign_id:
                context_str += f"\nCampaign ID: {campaign_id}"

            # Execute the workflow
            start_time = datetime.now()

            result = await executor.ainvoke(
                {"input": user_query, "context": context_str}
            )

            end_time = datetime.now()
            execution_time = (end_time - start_time).total_seconds()

            # Extract tools used from the result
            tools_used = []
            if hasattr(result, "intermediate_steps"):
                for step in result.intermediate_steps:
                    if len(step) >= 2:
                        action, output = step[0], step[1]
                        tools_used.append(
                            {
                                "tool_name": action.tool,
                                "input": action.tool_input,
                                "output": (
                                    str(output)[:200] + "..."
                                    if len(str(output)) > 200
                                    else str(output)
                                ),
                                "execution_time_seconds": 1.0,  # Approximate
                                "success": True,
                            }
                        )

            response = {
                "success": True,
                "message": "Agent workflow executed successfully",
                "result": result.get("output", str(result)),
                "tools_used": tools_used,
                "metadata": {
                    "workflow_id": f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    "steps_executed": len(tools_used),
                    "total_time_seconds": execution_time,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            }

            logger.info(
                "Agent workflow completed successfully",
                workflow_type=workflow_type,
                execution_time=execution_time,
                tools_used_count=len(tools_used),
            )

            return response

        except Exception as e:
            logger.error(
                "Agent workflow failed",
                error=str(e),
                workflow_type=workflow_type,
                user_query=user_query,
            )
            return {
                "success": False,
                "message": f"Agent workflow failed: {str(e)}",
                "result": "",
                "tools_used": [],
                "metadata": {
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat(),
                },
            }

    def _analyze_campaign_data(self, input_data: str) -> str:
        """Tool function for campaign data analysis"""
        try:
            logger.info("Campaign analyzer tool called", input=input_data)

            # Simulate campaign analysis (in production, this would query actual databases)
            analysis = {
                "performance_summary": "Campaign showing strong performance with 15% above benchmark CTR",
                "key_metrics": {
                    "ctr": "2.8% (15% above benchmark)",
                    "conversion_rate": "5.2% (stable)",
                    "roas": "4.2x (excellent)",
                },
                "recommendations": [
                    "Consider increasing budget by 20% for high-performing ad sets",
                    "Test new creative variations to maintain engagement",
                    "Expand to similar audiences",
                ],
            }

            return json.dumps(analysis, indent=2)

        except Exception as e:
            return f"Campaign analysis failed: {str(e)}"

    def _research_market_trends(self, input_data: str) -> str:
        """Tool function for market research"""
        try:
            logger.info("Market researcher tool called", input=input_data)

            # Simulate market research (in production, this might call external APIs)
            trends = {
                "market_overview": f"Current trends in {input_data} market",
                "growth_rate": "12% YoY growth",
                "key_players": ["Leader A", "Leader B", "Emerging Player C"],
                "opportunities": [
                    "Mobile-first strategies showing strong adoption",
                    "Video content engagement up 25%",
                    "AI-powered personalization gaining traction",
                ],
                "threats": [
                    "Increased competition",
                    "Rising acquisition costs",
                    "Privacy regulation impacts",
                ],
            }

            return json.dumps(trends, indent=2)

        except Exception as e:
            return f"Market research failed: {str(e)}"

    def _optimize_creatives(self, input_data: str) -> str:
        """Tool function for creative optimization"""
        try:
            logger.info("Creative optimizer tool called", input=input_data)

            optimization = {
                "current_performance": "Primary creative CTR declining by 8% over past week",
                "fatigue_indicators": "Frequency above 3.5, engagement dropping",
                "recommendations": [
                    "Launch new creative variations immediately",
                    "Test different value propositions",
                    "Implement dynamic creative optimization",
                    "Consider seasonal messaging updates",
                ],
                "priority_actions": [
                    "Create 3 new image variations",
                    "Test video formats",
                    "Update call-to-action text",
                ],
            }

            return json.dumps(optimization, indent=2)

        except Exception as e:
            return f"Creative optimization failed: {str(e)}"

    def _analyze_audience_insights(self, input_data: str) -> str:
        """Tool function for audience insights"""
        try:
            logger.info("Audience insights tool called", input=input_data)

            insights = {
                "top_segments": {
                    "tech_professionals_25_35": {
                        "performance": "Highest conversion rate at 7.2%",
                        "volume": "35% of total traffic",
                        "optimization": "Increase budget allocation",
                    },
                    "small_business_owners": {
                        "performance": "Strong engagement, lower conversion",
                        "volume": "25% of total traffic",
                        "optimization": "Test different messaging",
                    },
                },
                "behavioral_patterns": [
                    "Mobile usage peaks 7-9 PM",
                    "Desktop conversions higher during business hours",
                    "Weekend traffic shows different intent patterns",
                ],
                "expansion_opportunities": [
                    "Lookalike audiences based on top converters",
                    "Interest-based targeting expansion",
                    "Geographic expansion to similar markets",
                ],
            }

            return json.dumps(insights, indent=2)

        except Exception as e:
            return f"Audience analysis failed: {str(e)}"

    def _optimize_budget_allocation(self, input_data: str) -> str:
        """Tool function for budget optimization"""
        try:
            logger.info("Budget optimizer tool called", input=input_data)

            optimization = {
                "current_allocation": {
                    "facebook": "40% ($2,000)",
                    "google_ads": "35% ($1,750)",
                    "instagram": "25% ($1,250)",
                },
                "recommended_allocation": {
                    "facebook": "45% (+5% increase)",
                    "google_ads": "30% (-5% decrease)",
                    "instagram": "25% (maintain)",
                },
                "rationale": [
                    "Facebook showing 20% better ROAS",
                    "Google Ads CPC increased 15% this month",
                    "Instagram performance stable",
                ],
                "expected_impact": "12% improvement in overall ROAS",
            }

            return json.dumps(optimization, indent=2)

        except Exception as e:
            return f"Budget optimization failed: {str(e)}"
