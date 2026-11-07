from __future__ import annotations

from redis.asyncio import ConnectionPool, Redis

from app.core.config import settings


def _pool() -> ConnectionPool | None:
    url = settings.REDIS_URL
    if not url:
        return None
    try:
        return ConnectionPool.from_url(url, decode_responses=True)
    except Exception:
        return None


redis_pool = _pool()


async def get_redis() -> Redis | None:
    if redis_pool is None:
        return None
    try:
        client = Redis(connection_pool=redis_pool)
        await client.ping()
        return client
    except Exception:
        return None
