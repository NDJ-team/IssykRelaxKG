from __future__ import annotations

from typing import Any
from uuid import UUID

from app.application.dto.auth_dto import ChangePasswordRequest
from app.core.security import hash_password, verify_password
from app.domain.interfaces.repositories.user_repository import UserRepository


class ChangePasswordUseCase:
    def __init__(self, user_repo: UserRepository) -> None:
        self._user_repo = user_repo

    async def execute(self, user_id: UUID, request: ChangePasswordRequest) -> dict[str, Any]:
        user = await self._user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        if not verify_password(request.current_password, user.password_hash):
            raise ValueError("Неверный текущий пароль")
        await self._user_repo.update_password(user_id, hash_password(request.new_password))
        return {"message": "Пароль успешно изменён"}
