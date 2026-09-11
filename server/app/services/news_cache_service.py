"""
Postgres-backed cache in front of fetch_all_news().

RSS headlines don't change second to second, but /news/feed and the
sentiment agent both used to hit all 5 feeds on every single call. This
keeps one shared row (news_cache.id = 'global') with the raw fetched
items; a request only re-fetches from the feeds if that row is missing
or older than CACHE_TTL, otherwise it reads straight from the DB.
"""

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.news_cache import NewsCache
from app.services.news_service import fetch_all_news

logger = logging.getLogger(__name__)

CACHE_ID = "global"
CACHE_TTL = timedelta(minutes=5)


def _serialize(items: list[dict]) -> list[dict]:
    # JSONB can't store datetime objects -- flatten published_at to ISO text.
    serialized = []
    for item in items:
        published_at = item["published_at"]
        serialized.append({
            **item,
            "published_at": published_at.isoformat() if published_at else None,
        })
    return serialized


def _deserialize(items: list[dict]) -> list[dict]:
    deserialized = []
    for item in items:
        published_at = item.get("published_at")
        deserialized.append({
            **item,
            "published_at": datetime.fromisoformat(published_at) if published_at else None,
        })
    return deserialized


async def get_cached_news(db: AsyncSession) -> list[dict]:
    result = await db.execute(select(NewsCache).where(NewsCache.id == CACHE_ID))
    cache_row = result.scalar_one_or_none()

    is_fresh = cache_row is not None and (datetime.now(timezone.utc) - cache_row.fetched_at) < CACHE_TTL
    if is_fresh:
        return _deserialize(cache_row.payload)

    logger.info("News cache miss/stale -- refetching from RSS feeds")
    fresh_items = await fetch_all_news()

    # Upsert the single cache row. ON CONFLICT keeps this safe even if two
    # requests race to refresh at the same time -- last writer wins.
    stmt = insert(NewsCache).values(
        id=CACHE_ID,
        payload=_serialize(fresh_items),
        fetched_at=datetime.now(timezone.utc),
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=[NewsCache.id],
        set_={"payload": stmt.excluded.payload, "fetched_at": stmt.excluded.fetched_at},
    )
    await db.execute(stmt)
    await db.commit()

    return fresh_items
