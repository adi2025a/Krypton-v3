import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.core.security import get_current_user_id
from app.schemas.agent import ChatRequest, AgentResponse
from app.services.agent_service import run_trading_assistant, run_trading_assistant_stream

router = APIRouter()


@router.post("/chat", response_model=AgentResponse)
async def chat_with_agent(
    payload: ChatRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Synchronous chat endpoint with multi-turn conversation memory support.
    """
    history = [m.model_dump() for m in payload.history]
    result = await run_trading_assistant(db, user_id, user_question=payload.message, history=history)
    return AgentResponse(**result)


@router.post("/chat/stream")
async def chat_with_agent_stream(
    payload: ChatRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Real-time SSE token streaming endpoint. Streams tokens as they are produced by the LLM.
    """
    history = [m.model_dump() for m in payload.history]
    generator = run_trading_assistant_stream(db, user_id, user_question=payload.message, history=history)
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/strategy", response_model=AgentResponse)
async def get_strategy(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    The Strategy button. Generates an institutional confluence read on the current symbol.
    """
    result = await run_trading_assistant(db, user_id, user_question=None)
    return AgentResponse(**result)


@router.post("/strategy/stream")
async def get_strategy_stream(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Streaming strategy synthesis endpoint.
    """
    generator = run_trading_assistant_stream(db, user_id, user_question=None, history=[])
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )