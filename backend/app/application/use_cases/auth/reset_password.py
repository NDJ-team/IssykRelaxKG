from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from app.application.dto.auth_dto import ResetPasswordRequest
from app.core.security import hash_password
from app.domain.interfaces.repositories.user_repository import UserRepository


class ResetPasswordUseCase:
    def __init__(self, user_repo: UserRepository) -> None:
        self._user_repo = user_repo

    async def execute(self, request: ResetPasswordRequest) -> dict[str, Any]:
        user = await self._user_repo.get_by_reset_token(request.token)
        if not user:
            raise ValueError("Invalid or expired reset token")

        if not user.reset_token_expires_at or user.reset_token_expires_at.replace(tzinfo=UTC) < datetime.now(UTC):
            raise ValueError("Reset token has expired")

        new_hash = hash_password(request.new_password)
        await self._user_repo.update_password(user.id, new_hash)
        await self._user_repo.clear_reset_token(user.id)

        return {"message": "Password has been reset successfully"}
