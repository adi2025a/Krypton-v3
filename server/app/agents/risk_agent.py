"""
LangGraph node: risk_node.

Unlike market_analysis_node and sentiment_node, this one is CONDITIONAL --
it only produces a real result if Binance is connected. Concentration
risk is meaningless without knowing the user's actual holdings, so
there's no sensible fallback here the way there is for market/sentiment
data (which are always public and always available).

Two layers of defense against this running without data:
1. The GRAPH itself should route around this node entirely when
   binance_connected is False (a conditional edge in graph.py) -- so in
   the normal case, this function's body barely runs at all.
2. This function ALSO checks binance_connected/portfolio_balances itself
   and no-ops if either is missing. Defense in depth: if graph.py's
   routing ever has a bug, this node still won't crash or fabricate a
   risk score from no data.
"""

from app.agents.state import AgentState
from app.services.risk_service import compute_risk_profile
from app.services.binance_service import fetch_portfolio


async def risk_node(state: AgentState) -> dict:
    if not state.get("binance_connected"):
        return {}  # no-op: risk_profile stays whatever it already was (None)

    balances = state.get("portfolio_balances")
    if balances is None:
        api_key = state.get("binance_api_key")
        api_secret = state.get("binance_api_secret")
        if api_key and api_secret:
            try:
                balances = await fetch_portfolio(api_key, api_secret)
            except Exception as exc:
                return {"errors": [f"risk_node: failed to fetch Binance balances: {exc}"]}
        else:
            return {"errors": ["risk_node: Binance marked connected but credentials missing"]}

    if not balances:
        return {"risk_profile": None}

    try:
        risk_profile = await compute_risk_profile(
            balances=balances,
            symbol=state["symbol"],
            timeframe=state["timeframe"],
        )
        return {"risk_profile": risk_profile, "portfolio_balances": balances}
    except Exception as exc:
        return {"errors": [f"risk_node failed: {exc}"]}