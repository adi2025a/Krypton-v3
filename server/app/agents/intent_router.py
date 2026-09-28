"""
LangGraph node: intent_router_node.

Determines whether a user query is 'general' (conversational, educational, or
follow-up reasoning) or 'market' (actionable analysis, live indicators, sentiment,
or portfolio risk evaluation).

For 'general' queries, the graph bypasses external market and news data fetches,
saving 1-2 seconds of network latency and directly generating a response using
conversation history.
"""

from app.agents.state import AgentState


import re


def classify_intent(question: str | None) -> str:
    """
    Fast, deterministic intent classifier (<0.1ms).
    Separates general/conversational/educational questions from market/strategy questions.
    """
    if not question:
        return "market"

    q = question.strip().lower()

    # Actionable trading requests & live data requests ALWAYS need market data
    market_terms = [
        "buy", "sell", "long", "short", "entry", "exit", "target", "position",
        "forecast", "outlook", "strategy", "trend", "levels", "support",
        "resistance", "today", "now", "currently", "price", "latest", "current",
        "sentiment score", "portfolio", "holdings", "balance"
    ]
    if any(re.search(r"\b" + re.escape(w) + r"\b", q) for w in market_terms):
        return "market"

    # Greetings and pleasantries
    greetings = {
        "hi", "hello", "hey", "hola", "sup", "yo", "good morning",
        "good afternoon", "good evening", "how are you", "who are you",
        "what are you", "thanks", "thank you", "ok", "okay", "cool",
        "bye", "goodbye"
    }
    if q in greetings or any(q.startswith(g + " ") or q.endswith(" " + g) for g in ["hi", "hello", "hey", "thanks", "thank you"]):
        return "general"

    # Educational / conceptual queries
    edu_terms = [
        "what is", "what are", "explain", "how does", "how do i",
        "how to read", "help me understand", "tell me about", "define", "meaning of"
    ]
    if any(t in q for t in edu_terms):
        return "general"

    # Conversational follow-ups that reason over previous messages
    followups = {"why?", "why", "can you elaborate?", "explain why", "tell me more", "what do you mean?"}
    if q in followups:
        return "general"

    # Default to "market" for actionable trading, strategy, and asset inquiries
    return "market"



async def intent_router_node(state: AgentState) -> dict:
    """
    LangGraph entry node: evaluates the user's intent and records it in state.
    """
    intent = classify_intent(state.get("user_question"))
    return {"intent": intent}
