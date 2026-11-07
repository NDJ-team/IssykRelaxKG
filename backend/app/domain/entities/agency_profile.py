from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class AgencyProfile:
    id: UUID
    user_id: UUID
    company_name: str
    description: str | None
    license_number: str | None
    is_approved: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(
        cls,
        user_id: UUID,
        company_name: str,
        description: str | None = None,
        license_number: str | None = None,
    ) -> AgencyProfile:
        now = datetime.now()
        return cls(
            id=uuid4(),
            user_id=user_id,
            company_name=company_name,
            description=description,
            license_number=license_number,
            is_approved=False,
            created_at=now,
            updated_at=now,
        )
