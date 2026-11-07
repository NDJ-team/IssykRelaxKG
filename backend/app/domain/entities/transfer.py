from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4


@dataclass
class Transfer:
    id: UUID
    driver_id: UUID
    title: str
    description: str | None
    from_location: str
    to_location: str
    price: Decimal
    currency: str
    max_passengers: int
    vehicle_type: str | None
    duration_minutes: int | None
    status: str
    is_active: bool
    city_id: UUID | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(
        cls,
        driver_id: UUID,
        title: str,
        from_location: str,
        to_location: str,
        price: Decimal,
        max_passengers: int = 4,
        currency: str = "KGS",
        description: str | None = None,
        vehicle_type: str | None = None,
        duration_minutes: int | None = None,
        city_id: UUID | None = None,
    ) -> Transfer:
        now = datetime.now()
        return cls(
            id=uuid4(),
            driver_id=driver_id,
            title=title,
            description=description,
            from_location=from_location,
            to_location=to_location,
            price=price,
            currency=currency,
            max_passengers=max_passengers,
            vehicle_type=vehicle_type,
            duration_minutes=duration_minutes,
            status="pending",
            is_active=True,
            city_id=city_id,
            created_at=now,
            updated_at=now,
        )
