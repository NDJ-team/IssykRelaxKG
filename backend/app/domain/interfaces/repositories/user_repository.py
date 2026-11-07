from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from uuid import UUID

from app.domain.entities.user import User


class UserRepository(ABC):
    @abstractmethod
    async def create(self, user: User) -> User: ...

    @abstractmethod
    async def create_owner_profile(self, user_id: UUID, business_phone: str | None = None) -> None: ...

    @abstractmethod
    async def create_provider_profile(self, user_id: UUID, role_slug: str) -> None: ...

    @abstractmethod
    async def has_owner_profile(self, user_id: UUID) -> bool: ...

    @abstractmethod
    async def has_provider_profile(self, user_id: UUID, role_slug: str) -> bool: ...

    @abstractmethod
    async def get_user_role(self, user_id: UUID) -> str | None: ...

    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> User | None: ...

    @abstractmethod
    async def get_by_email(self, email: str) -> User | None: ...

    @abstractmethod
    async def update(self, user: User) -> User: ...

    @abstractmethod
    async def delete(self, user_id: UUID) -> None: ...

    @abstractmethod
    async def exists_by_email(self, email: str) -> bool: ...

    @abstractmethod
    async def list_owners(self, approved: bool | None = None, offset: int = 0, limit: int = 20) -> tuple[list[User], int]: ...

    @abstractmethod
    async def update_password(self, user_id: UUID, password_hash: str) -> None: ...

    @abstractmethod
    async def get_by_reset_token(self, token: str) -> User | None: ...

    @abstractmethod
    async def set_reset_token(self, user_id: UUID, token: str, expires_at: datetime) -> None: ...

    @abstractmethod
    async def clear_reset_token(self, user_id: UUID) -> None: ...
