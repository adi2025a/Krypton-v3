"""
One function, `call_llm`, that any agent node can use -- it hides each
provider's different SDK/message format behind one consistent interface:

    call_llm(provider, model_name, api_key, messages) -> str

`messages` is always a list of {"role": "system"|"user"|"assistant", "content": str},
matching OpenAI's convention (the most widely used shape) -- we translate
into Gemini's/Claude's own formats internally, so agent code never has
to know which provider it's talking to.
"""

from typing import TypedDict, AsyncIterator


class ChatMessage(TypedDict):
    role: str
    content: str


async def _call_openai(model_name: str, api_key: str, messages: list[ChatMessage]) -> str:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=api_key)
    resp = await client.chat.completions.create(model=model_name, messages=messages)
    return resp.choices[0].message.content or ""


async def _stream_openai(model_name: str, api_key: str, messages: list[ChatMessage]) -> AsyncIterator[str]:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=api_key)
    stream = await client.chat.completions.create(model=model_name, messages=messages, stream=True)
    async for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


async def _call_groq(model_name: str, api_key: str, messages: list[ChatMessage]) -> str:
    from groq import AsyncGroq
    client = AsyncGroq(api_key=api_key)
    resp = await client.chat.completions.create(model=model_name, messages=messages)
    return resp.choices[0].message.content or ""


async def _stream_groq(model_name: str, api_key: str, messages: list[ChatMessage]) -> AsyncIterator[str]:
    from groq import AsyncGroq
    client = AsyncGroq(api_key=api_key)
    stream = await client.chat.completions.create(model=model_name, messages=messages, stream=True)
    async for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


async def _call_gemini(model_name: str, api_key: str, messages: list[ChatMessage]) -> str:
    from google import genai

    target_model = model_name
    if "1.5-flash" in model_name or "1.0-flash" in model_name:
        target_model = "gemini-2.5-flash"
    elif "1.5-pro" in model_name or "1.0-pro" in model_name:
        target_model = "gemini-2.5-pro"

    prompt_parts = [f"[{m['role'].upper()}]: {m['content']}" for m in messages]
    prompt = "\n\n".join(prompt_parts)

    client = genai.Client(api_key=api_key)
    try:
        response = await client.aio.models.generate_content(
            model=target_model,
            contents=prompt,
        )
        return response.text or ""
    except Exception:
        if target_model != "gemini-2.5-flash":
            response = await client.aio.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return response.text or ""
        raise


async def _stream_gemini(model_name: str, api_key: str, messages: list[ChatMessage]) -> AsyncIterator[str]:
    from google import genai

    target_model = model_name
    if "1.5-flash" in model_name or "1.0-flash" in model_name:
        target_model = "gemini-2.5-flash"
    elif "1.5-pro" in model_name or "1.0-pro" in model_name:
        target_model = "gemini-2.5-pro"

    prompt_parts = [f"[{m['role'].upper()}]: {m['content']}" for m in messages]
    prompt = "\n\n".join(prompt_parts)

    client = genai.Client(api_key=api_key)
    try:
        response = await client.aio.models.generate_content_stream(
            model=target_model,
            contents=prompt,
        )
        async for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception:
        if target_model != "gemini-2.5-flash":
            response = await client.aio.models.generate_content_stream(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        else:
            raise


async def _call_claude(model_name: str, api_key: str, messages: list[ChatMessage]) -> str:
    from anthropic import AsyncAnthropic
    client = AsyncAnthropic(api_key=api_key)

    system_msg = next((m["content"] for m in messages if m["role"] == "system"), None)
    chat_messages = [m for m in messages if m["role"] != "system"]

    resp = await client.messages.create(
        model=model_name,
        max_tokens=1024,
        system=system_msg,
        messages=chat_messages,
    )
    return resp.content[0].text or ""


async def _stream_claude(model_name: str, api_key: str, messages: list[ChatMessage]) -> AsyncIterator[str]:
    from anthropic import AsyncAnthropic
    client = AsyncAnthropic(api_key=api_key)

    system_msg = next((m["content"] for m in messages if m["role"] == "system"), None)
    chat_messages = [m for m in messages if m["role"] != "system"]

    async with client.messages.stream(
        model=model_name,
        max_tokens=1024,
        system=system_msg,
        messages=chat_messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text


_PROVIDER_CALLERS = {
    "openai": _call_openai,
    "groq": _call_groq,
    "gemini": _call_gemini,
    "claude": _call_claude,
}

_STREAM_CALLERS = {
    "openai": _stream_openai,
    "groq": _stream_groq,
    "gemini": _stream_gemini,
    "claude": _stream_claude,
}


async def call_llm(provider: str, model_name: str, api_key: str, messages: list[ChatMessage]) -> str:
    caller = _PROVIDER_CALLERS.get(provider)
    if caller is None:
        raise ValueError(f"Unsupported LLM provider: {provider}")
    return await caller(model_name, api_key, messages)


async def stream_llm(provider: str, model_name: str, api_key: str, messages: list[ChatMessage]) -> AsyncIterator[str]:
    caller = _STREAM_CALLERS.get(provider)
    if caller is None:
        raise ValueError(f"Unsupported LLM provider: {provider}")
    async for token in caller(model_name, api_key, messages):
        yield token