from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class GuideProfile:
    id: UUID
    user_id: UUID
    bio: str | None
    languages: str | None
    is_approved: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(cls, user_id: UUID, bio: str | None = None, languages: str | None = None) -> GuideProfile:
        now = datetime.now()
        return cls(id=uuid4(), user_id=user_id, bio=bio, languages=languages, is_approved=False, created_at=now, updated_at=now)
