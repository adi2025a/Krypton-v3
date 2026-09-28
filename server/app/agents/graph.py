"""
Wires the four nodes into one LangGraph StateGraph.

Execution shape:

    market_analysis  ─┐
    sentiment        ─┼──> synthesis (the ONLY node that calls an LLM)
    risk             ─┘

market_analysis, sentiment, and risk all run CONCURRENTLY -- none of them
depends on another's output. LangGraph runs any nodes with no unmet
dependencies in the same "superstep" (in parallel). Only synthesis waits
for all three to finish before it runs.

Note on risk_node: it's wired in UNCONDITIONALLY here, not skipped via a
conditional edge, even though risk analysis is optional. That's a
deliberate simplification -- risk_node already checks `binance_connected`
internally (see risk_agent.py) and returns instantly, with no network
calls, when it's False. True conditional graph routing
(StateGraph.add_conditional_edges) would only be worth the added
complexity if entering this node had a real cost even when skipping --
it doesn't, so the simpler unconditional wiring is the right call here.
"""

from langgraph.graph import StateGraph, START, END

from app.agents.state import AgentState
from app.agents.intent_router import intent_router_node
from app.agents.market_analysis_agent import market_analysis_node
from app.agents.sentiment_agent import sentiment_node
from app.agents.risk_agent import risk_node
from app.agents.synthesis_agent import synthesis_node


def route_by_intent(state: AgentState) -> list[str]:
    """
    Directs general/conversational queries straight to synthesis, bypassing
    data gathering. Directs market/strategy queries to parallel data nodes.
    """
    if state.get("intent") == "general":
        return ["synthesis"]
    return ["market_analysis", "sentiment", "risk"]


def build_agent_graph():
    builder = StateGraph(AgentState)

    builder.add_node("router", intent_router_node)
    builder.add_node("market_analysis", market_analysis_node)
    builder.add_node("sentiment", sentiment_node)
    builder.add_node("risk", risk_node)
    builder.add_node("synthesis", synthesis_node)

    # 1. Entry point: evaluate intent
    builder.add_edge(START, "router")

    # 2. Dynamic conditional branch based on user intent
    builder.add_conditional_edges(
        "router",
        route_by_intent,
        ["synthesis", "market_analysis", "sentiment", "risk"],
    )

    # 3. Fan-in: parallel data nodes converge into synthesis
    builder.add_edge("market_analysis", "synthesis")
    builder.add_edge("sentiment", "synthesis")
    builder.add_edge("risk", "synthesis")

    # 4. Synthesis terminates the graph
    builder.add_edge("synthesis", END)

    return builder.compile()


# Compiled ONCE at import time, not per-request -- compiling builds the
# execution plan (which nodes can run in parallel, dependency ordering
# etc), which is wasted work to redo on every single chat message.
agent_graph = build_agent_graph()