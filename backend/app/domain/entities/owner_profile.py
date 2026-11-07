from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class OwnerProfile:
    id: UUID
    user_id: UUID
    is_approved: bool
    business_phone: str | None
    created_at: datetime

    @classmethod
    def create(cls, user_id: UUID, business_phone: str | None = None) -> OwnerProfile:
        return cls(
            id=uuid4(),
            user_id=user_id,
            is_approved=False,
            business_phone=business_phone,
            created_at=datetime.now(),
        )
