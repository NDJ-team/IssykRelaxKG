from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class RestaurantPartnerProfile:
    id: UUID
    user_id: UUID
    restaurant_name: str
    description: str | None
    cuisine_type: str | None
    address: str | None
    phone: str | None
    is_approved: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(
        cls,
        user_id: UUID,
        restaurant_name: str,
        description: str | None = None,
        cuisine_type: str | None = None,
        address: str | None = None,
        phone: str | None = None,
    ) -> RestaurantPartnerProfile:
        now = datetime.now()
        return cls(
            id=uuid4(),
            user_id=user_id,
            restaurant_name=restaurant_name,
            description=description,
            cuisine_type=cuisine_type,
            address=address,
            phone=phone,
            is_approved=False,
            created_at=now,
            updated_at=now,
        )
