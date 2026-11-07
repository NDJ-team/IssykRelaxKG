from __future__ import annotations

import json
from typing import Any

from redis.asyncio import Redis

from app.core.redis import get_redis


class RedisCache:
    def __init__(self, prefix: str = "issykrelax") -> None:
        self._prefix = prefix

    async def _get_redis(self) -> Redis:
        return await get_redis()

    def _key(self, suffix: str) -> str:
        return f"{self._prefix}:{suffix}"

    async def get(self, key: str) -> Any | None:
        redis = await self._get_redis()
        data = await redis.get(self._key(key))
        if data:
            return json.loads(data)
        return None

    async def set(self, key: str, value: Any, ttl: int = 300) -> None:
        redis = await self._get_redis()
        await redis.setex(self._key(key), ttl, json.dumps(value, default=str))

    async def delete(self, key: str) -> None:
        redis = await self._get_redis()
        await redis.delete(self._key(key))

    async def clear_pattern(self, pattern: str) -> None:
        redis = await self._get_redis()
        cursor = 0
        while True:
            cursor, keys = await redis.scan(cursor, match=self._key(pattern))
            if keys:
                await redis.delete(*keys)
            if cursor == 0:
                break
