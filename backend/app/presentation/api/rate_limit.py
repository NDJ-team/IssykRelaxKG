"""Redis-based rate limiter for API endpoints."""
from __future__ import annotations

import time
from typing import Callable

from fastapi import Depends, HTTPException, Request, status
from redis.asyncio import Redis

from app.core.redis import get_redis


class RateLimiter:
    """Sliding window rate limiter backed by Redis.

    Usage:
        limiter = RateLimiter(max_requests=10, window_seconds=60)

        @router.post("/login")
        async def login(..., _: None = Depends(limiter)):
            ...
    """

    def __init__(
        self,
        max_requests: int = 10,
        window_seconds: int = 60,
        key_prefix: str = "rate_limit",
    ) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.key_prefix = key_prefix

    async def __call__(self, request: Request, redis: Redis | None = Depends(get_redis)) -> None:
        if redis is None:
            return
        client_ip = request.client.host if request.client else "unknown"
        route_path = request.url.path
        key = f"{self.key_prefix}:{route_path}:{client_ip}"

        now = time.time()
        window_start = now - self.window_seconds

        # Remove old entries and count recent ones
        await redis.zremrangebyscore(key, 0, window_start)
        request_count = await redis.zcard(key)

        if request_count >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Try again in {self.window_seconds} seconds.",
            )

        # Add current request with timestamp
        await redis.zadd(key, {str(now): now})
        await redis.expire(key, self.window_seconds)


# Pre-configured limiters for different endpoint sensitivities
login_limiter = RateLimiter(max_requests=10, window_seconds=60, key_prefix="rl:login")
register_limiter = RateLimiter(max_requests=5, window_seconds=300, key_prefix="rl:register")  # 5 per 5 min
password_limiter = RateLimiter(max_requests=3, window_seconds=300, key_prefix="rl:password")  # 3 per 5 min
general_auth_limiter = RateLimiter(max_requests=30, window_seconds=60, key_prefix="rl:auth")
