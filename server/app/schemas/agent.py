from typing import Optional, Literal
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)


class AgentResponse(BaseModel):
    final_response: Optional[str]
    intent: Optional[str] = None
    indicators: Optional[dict] = None
    news_items: Optional[list[dict]] = None
    sentiment_summary: Optional[dict] = None
    risk_profile: Optional[dict] = None
    errors: list[str] = []