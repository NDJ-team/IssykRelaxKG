from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4


class UserRoleSlug:
    USER = "tourist"
    OWNER = "owner"
    DRIVER = "driver"
    GUIDE = "guide"
    ACTIVITY_PROVIDER = "activity_provider"
    RESTAURANT_PARTNER = "restaurant_partner"
    AGENCY = "agency"
    CONCIERGE = "concierge"
    TRANSLATOR = "translator"
    ADMIN = "admin"
    MODERATOR = "moderator"
    FINANCE_MANAGER = "finance_manager"


@dataclass
class User:
    id: UUID
    email: str
    password_hash: str
    full_name: str
    phone: str | None
    avatar_url: str | None
    is_active: bool
    is_verified: bool
    is_superuser: bool
    reset_token: str | None
    reset_token_expires_at: datetime | None
    created_at: datetime
    updated_at: datetime

    @property
    def role(self) -> str:
        if self.is_superuser:
            return UserRoleSlug.ADMIN
        return UserRoleSlug.USER

    @classmethod
    def create(
        cls,
        email: str,
        password_hash: str,
        full_name: str,
        phone: str | None = None,
    ) -> User:
        now = datetime.now()
        return cls(
            id=uuid4(),
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            phone=phone,
            avatar_url=None,
            is_active=True,
            is_verified=False,
            is_superuser=False,
            reset_token=None,
            reset_token_expires_at=None,
            created_at=now,
            updated_at=now,
        )
