from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4


@dataclass
class Activity:
    id: UUID
    provider_id: UUID
    title: str
    description: str | None
    price: Decimal
    currency: str
    max_participants: int
    duration_minutes: int | None
    location: str
    city_id: UUID | None
    status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(
        cls,
        provider_id: UUID,
        title: str,
        price: Decimal,
        max_participants: int = 10,
        currency: str = "KGS",
        description: str | None = None,
        duration_minutes: int | None = None,
        location: str = "",
        city_id: UUID | None = None,
    ) -> Activity:
        now = datetime.now()
        return cls(
            id=uuid4(),
            provider_id=provider_id,
            title=title,
            description=description,
            price=price,
            currency=currency,
            max_participants=max_participants,
            duration_minutes=duration_minutes,
            location=location,
            city_id=city_id,
            status="pending",
            is_active=True,
            created_at=now,
            updated_at=now,
        )
