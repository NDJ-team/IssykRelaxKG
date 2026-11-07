from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class Review:
    id: UUID
    property_id: UUID
    user_id: UUID
    booking_id: UUID
    rating: int
    comment: str | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(
        cls,
        property_id: UUID,
        user_id: UUID,
        booking_id: UUID,
        rating: int,
        comment: str | None = None,
    ) -> Review:
        now = datetime.now()
        return cls(
            id=uuid4(),
            property_id=property_id,
            user_id=user_id,
            booking_id=booking_id,
            rating=rating,
            comment=comment,
            created_at=now,
            updated_at=now,
        )
