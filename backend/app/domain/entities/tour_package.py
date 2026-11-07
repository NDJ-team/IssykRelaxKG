from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4


@dataclass
class TourPackage:
    id: UUID
    agency_id: UUID
    title: str
    description: str | None
    price: Decimal
    currency: str
    duration_days: int
    max_guests: int
    includes: str | None
    itinerary: dict | None
    status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(
        cls,
        agency_id: UUID,
        title: str,
        price: Decimal,
        duration_days: int,
        max_guests: int = 10,
        currency: str = "KGS",
        description: str | None = None,
        includes: str | None = None,
        itinerary: dict | None = None,
    ) -> TourPackage:
        now = datetime.now()
        return cls(
            id=uuid4(),
            agency_id=agency_id,
            title=title,
            description=description,
            price=price,
            currency=currency,
            duration_days=duration_days,
            max_guests=max_guests,
            includes=includes,
            itinerary=itinerary,
            status="pending",
            is_active=True,
            created_at=now,
            updated_at=now,
        )
