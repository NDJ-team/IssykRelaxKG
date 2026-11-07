from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class DriverProfile:
    id: UUID
    user_id: UUID
    bio: str | None
    license_number: str | None
    vehicle_info: str | None
    is_approved: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(
        cls,
        user_id: UUID,
        bio: str | None = None,
        license_number: str | None = None,
        vehicle_info: str | None = None,
    ) -> DriverProfile:
        now = datetime.now()
        return cls(
            id=uuid4(),
            user_id=user_id,
            bio=bio,
            license_number=license_number,
            vehicle_info=vehicle_info,
            is_approved=False,
            created_at=now,
            updated_at=now,
        )
