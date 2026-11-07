from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4


@dataclass
class Tour:
    id: UUID
    guide_id: UUID
    title: str
    description: str | None
    price: Decimal
    currency: str
    duration_days: int
    max_guests: int
    includes: str | None
    meeting_point: str | None
    city_id: UUID | None
    status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(
        cls, guide_id: UUID, title: str, price: Decimal, duration_days: int, max_guests: int = 10,
        currency: str = "KGS", description: str | None = None, includes: str | None = None,
        meeting_point: str | None = None, city_id: UUID | None = None,
    ) -> Tour:
        now = datetime.now()
        return cls(
            id=uuid4(), guide_id=guide_id, title=title, description=description, price=price,
            currency=currency, duration_days=duration_days, max_guests=max_guests,
            includes=includes, meeting_point=meeting_point, city_id=city_id,
            status="pending", is_active=True, created_at=now, updated_at=now,
        )
