from __future__ import annotations

from uuid import UUID

from app.application.dto.auth_dto import UserResponse
from app.domain.interfaces.repositories.user_repository import UserRepository


class GetMeUseCase:
    def __init__(self, user_repo: UserRepository) -> None:
        self._user_repo = user_repo

    async def execute(self, user_id: UUID) -> UserResponse:
        user = await self._user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        role = await self._user_repo.get_user_role(user_id)
        if not role:
            role = user.role

        return UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            avatar_url=user.avatar_url,
            role=role,
            is_verified=user.is_verified,
        )
