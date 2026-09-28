"""
LangGraph node: synthesis_node.

This is the ONLY node in the entire graph that calls an LLM. Every other
node (market_analysis, sentiment, risk) just gathers deterministic data.
This node's whole job is to take whatever data actually got populated
(some fields may be None -- risk_profile if Binance isn't connected,
indicators if Binance's candle API had an outage) and turn it into one
coherent, natural-language answer.

Two trigger modes, both handled by the same node:
1. Chatbot mode: state["user_question"] is set -- answer that specific
   question using the gathered context.
2. Strategy-button mode: state["user_question"] is None -- produce a
   general "here's the current picture" synthesis instead.
"""

from app.agents.state import AgentState
from app.services.llm_client_service import call_llm, stream_llm


def _build_prompt(state: AgentState) -> list[dict]:
    symbol = state["symbol"]
    timeframe = state["timeframe"]
    intent = state.get("intent", "market")
    indicators = state.get("indicators")
    sentiment_summary = state.get("sentiment_summary")
    risk_profile = state.get("risk_profile")
    errors = state.get("errors") or []
    history = state.get("history") or []
    user_question = state.get("user_question")

    if intent == "general":
        system_prompt = (
            "You are Krypton AI Copilot, an intelligent crypto trading assistant. "
            "Provide insightful, concise, and educational responses to general trading concepts, "
            "crypto market mechanics, technical indicators, and conversational queries. "
            "Maintain conversational context from recent conversation turns. If asked 'why' or for "
            "clarifications, directly connect your answer to the previous discussion. "
            "Keep responses structured, punchy, and clear."
        )
        current_prompt = user_question or "Hello! How can I assist you with crypto trading today?"
    else:
        # Market / Strategy intent -> Confluence analysis
        context_lines = [f"Symbol: {symbol}", f"Timeframe: {timeframe}"]

        if indicators:
            context_lines.append(
                "Technical indicators:\n"
                f"- EMA: 20={indicators['ema']['ema20']:.2f}, 50={indicators['ema']['ema50']:.2f} "
                f"({indicators['ema']['trend']} trend/crossover)\n"
                f"- RSI: {indicators['rsi']['value']:.1f} ({indicators['rsi']['state']})\n"
                f"- MACD: {indicators['macd']['trend']} (histogram={indicators['macd']['histogram']:.4f})\n"
                f"- Bollinger Bands: price is {indicators['bollinger_bands']['position']}"
            )
        else:
            context_lines.append("Technical indicators: unavailable right now.")

        if sentiment_summary:
            context_lines.append(
                f"News sentiment: {sentiment_summary['overall_label']} "
                f"(avg score {sentiment_summary['avg_score']}, "
                f"{sentiment_summary['bullish_count']} bullish / "
                f"{sentiment_summary['bearish_count']} bearish / "
                f"{sentiment_summary['neutral_count']} neutral headlines)"
            )
        else:
            context_lines.append("News sentiment: unavailable right now.")

        if risk_profile:
            context_lines.append(
                f"Portfolio risk: {risk_profile['overall_risk_label']} "
                f"(score {risk_profile['overall_risk_score']}/100) -- "
                f"{risk_profile['concentration']['pct_of_portfolio']:.1f}% of portfolio in "
                f"{risk_profile['concentration']['asset']}, "
                f"volatility is {risk_profile['volatility']['label']}"
            )
        else:
            context_lines.append("Portfolio risk: not available (Binance not connected).")

        if errors:
            context_lines.append(f"Data feed notes: {'; '.join(errors)}")

        context_block = "\n\n".join(context_lines)

        system_prompt = (
            "You are Krypton AI Copilot, an institutional crypto confluence analyst. "
            "Synthesize technical momentum, multi-timeframe trends, news sentiment, and portfolio risk "
            "into a high-signal, actionable market read.\n\n"
            "Reasoning Guidelines:\n"
            "1. Trend & Momentum Confluence: Check if RSI/MACD agree or diverge from the EMA trend. "
            "Identify overbought/oversold exhaustion or trend continuation.\n"
            "2. Sentiment Cross-Examination: Weigh news sentiment against current price action (e.g. bullish news during technical resistance).\n"
            "3. Portfolio Risk Awareness: If portfolio risk is provided and concentration/volatility is elevated, proactively highlight risk exposure.\n"
            "4. Structure your response concisely:\n"
            "   • **Market Bias:** [Bullish / Bearish / Neutral / Caution]\n"
            "   • **Key Confluence Factors:** (2-3 bullet points of critical data points)\n"
            "   • **Invalidation & Risk Level:** (Clear levels to watch and risk caution)\n\n"
            "Always remind the user this is data-driven analysis, not financial advice."
        )

        if user_question:
            current_prompt = f"Current Market Data Context:\n\n{context_block}\n\nUser Question: {user_question}"
        else:
            current_prompt = f"Current Market Data Context:\n\n{context_block}\n\nSynthesize comprehensive trading strategy and confluence read for {symbol}."

    messages: list[dict] = [{"role": "system", "content": system_prompt}]

    # Append recent conversation turns for multi-turn conversational memory
    if history:
        for turn in history[-6:]:
            role = turn.get("role")
            content = turn.get("content")
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": current_prompt})
    return messages


async def synthesis_node(state: AgentState) -> dict:
    api_key = state.get("llm_api_key")
    if not api_key:
        return {"final_response": "No active LLM key is set. Please add one in settings to use the assistant."}

    messages = _build_prompt(state)
    token_queue = state.get("token_queue")

    try:
        if token_queue is not None:
            collected = []
            async for token in stream_llm(
                provider=state["llm_provider"],
                model_name=state["llm_model_name"],
                api_key=api_key,
                messages=messages,
            ):
                await token_queue.put(token)
                collected.append(token)
            await token_queue.put(None)  # Sentinel to end stream
            return {"final_response": "".join(collected)}
        else:
            response_text = await call_llm(
                provider=state["llm_provider"],
                model_name=state["llm_model_name"],
                api_key=api_key,
                messages=messages,
            )
            return {"final_response": response_text}
    except Exception as exc:
        if token_queue is not None:
            await token_queue.put(None)
        return {
            "final_response": "The assistant couldn't generate a response right now -- your LLM provider may be unreachable or the key may have stopped working.",
            "errors": [f"synthesis_node: LLM call failed: {exc}"],
        }