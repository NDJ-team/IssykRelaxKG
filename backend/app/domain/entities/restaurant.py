from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class Restaurant:
    id: UUID
    partner_id: UUID
    name: str
    description: str | None
    cuisine_type: str | None
    address: str | None
    phone: str | None
    price_range: str | None
    opening_hours: str | None
    city_id: UUID | None
    status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(
        cls,
        partner_id: UUID,
        name: str,
        description: str | None = None,
        cuisine_type: str | None = None,
        address: str | None = None,
        phone: str | None = None,
        price_range: str | None = None,
        opening_hours: str | None = None,
        city_id: UUID | None = None,
    ) -> Restaurant:
        now = datetime.now()
        return cls(
            id=uuid4(),
            partner_id=partner_id,
            name=name,
            description=description,
            cuisine_type=cuisine_type,
            address=address,
            phone=phone,
            price_range=price_range,
            opening_hours=opening_hours,
            city_id=city_id,
            status="pending",
            is_active=True,
            created_at=now,
            updated_at=now,
        )
