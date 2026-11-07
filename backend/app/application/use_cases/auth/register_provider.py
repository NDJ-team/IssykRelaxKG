from __future__ import annotations

from app.application.dto.auth_dto import RegisterProviderRequest, TokenResponse
from app.core.security import create_access_token, create_refresh_token, hash_password
from app.domain.entities.user import User
from app.domain.interfaces.repositories.user_repository import UserRepository


class RegisterProviderUseCase:
    def __init__(self, user_repo: UserRepository) -> None:
        self._user_repo = user_repo

    async def execute(self, request: RegisterProviderRequest) -> TokenResponse:
        exists = await self._user_repo.exists_by_email(request.email)
        if exists:
            raise ValueError("User with this email already exists")

        user = User.create(
            email=request.email,
            password_hash=hash_password(request.password),
            full_name=request.full_name,
            phone=request.phone,
        )
        await self._user_repo.create(user)
        await self._user_repo.create_provider_profile(user.id, request.role_slug)

        return TokenResponse(
            access_token=create_access_token(subject=str(user.id)),
            refresh_token=create_refresh_token(subject=str(user.id)),
        )
