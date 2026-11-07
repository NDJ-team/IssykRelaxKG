from __future__ import annotations

from app.application.dto.auth_dto import LoginRequest, TokenResponse
from app.core.security import create_access_token, create_refresh_token, verify_password
from app.domain.interfaces.repositories.user_repository import UserRepository


class LoginUserUseCase:
    def __init__(self, user_repo: UserRepository) -> None:
        self._user_repo = user_repo

    async def execute(self, request: LoginRequest) -> TokenResponse:
        user = await self._user_repo.get_by_email(request.email)
        if not user or not verify_password(request.password, user.password_hash):
            raise ValueError("Invalid email or password")

        return TokenResponse(
            access_token=create_access_token(subject=str(user.id)),
            refresh_token=create_refresh_token(subject=str(user.id)),
        )
