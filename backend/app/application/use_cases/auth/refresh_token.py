from __future__ import annotations

from app.application.dto.auth_dto import RefreshTokenRequest, TokenResponse
from app.core.security import create_access_token, create_refresh_token, decode_token


class RefreshTokenUseCase:
    async def execute(self, request: RefreshTokenRequest) -> TokenResponse:
        payload = decode_token(request.refresh_token)
        sub = payload.get("sub")
        if not sub or payload.get("type") != "refresh":
            raise ValueError("Invalid or expired refresh token")

        return TokenResponse(
            access_token=create_access_token(subject=sub),
            refresh_token=create_refresh_token(subject=sub),
        )
