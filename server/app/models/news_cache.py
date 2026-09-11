from datetime import datetime, timezone

from sqlalchemy import String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class NewsCache(Base):
    """
    Caches the raw, unranked headlines pulled from all RSS feeds.

    Single row keyed by a fixed id -- news isn't fetched per-symbol
    (ranking/sentiment happen per-request against this shared pool), so
    there's only ever one cache entry to keep fresh.
    """
    __tablename__ = "news_cache"

    id: Mapped[str] = mapped_column(String(20), primary_key=True, default="global")

    # Named "payload" (not "items") -- SQLAlchemy's `insert(...).excluded`
    # is dict-like and already has an `.items()` method, which shadows
    # attribute-based access to a column actually named "items".
    payload: Mapped[list] = mapped_column(JSONB, nullable=False)

    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
