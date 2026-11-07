from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class Favorite:
    id: UUID
    user_id: UUID
    property_id: UUID
    created_at: datetime

    @classmethod
    def create(cls, user_id: UUID, property_id: UUID) -> Favorite:
        return cls(
            id=uuid4(),
            user_id=user_id,
            property_id=property_id,
            created_at=datetime.now(),
        )
