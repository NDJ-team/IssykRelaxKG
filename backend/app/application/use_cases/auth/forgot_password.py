from __future__ import annotations

import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

from app.application.dto.auth_dto import ForgotPasswordRequest
from app.domain.interfaces.repositories.user_repository import UserRepository
from app.domain.interfaces.services.email_service import EmailService


class ForgotPasswordUseCase:
    def __init__(self, user_repo: UserRepository, email_service: EmailService) -> None:
        self._user_repo = user_repo
        self._email_service = email_service

    async def execute(self, request: ForgotPasswordRequest) -> dict[str, Any]:
        user = await self._user_repo.get_by_email(request.email)
        if not user:
            return {"message": "Если email зарегистрирован, инструкции отправлены на почту"}

        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(UTC) + timedelta(hours=1)
        await self._user_repo.set_reset_token(user.id, token, expires_at)
        await self._email_service.send_password_reset(request.email, token)

        return {"message": "Если email зарегистрирован, инструкции отправлены на почту"}
