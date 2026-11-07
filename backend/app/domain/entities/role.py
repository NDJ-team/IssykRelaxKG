from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


class RoleSlug:
    TOURIST = "tourist"
    OWNER = "owner"
    DRIVER = "driver"
    GUIDE = "guide"
    ACTIVITY_PROVIDER = "activity_provider"
    RESTAURANT_PARTNER = "restaurant_partner"
    AGENCY = "agency"
    CONCIERGE = "concierge"
    TRANSLATOR = "translator"
    ADMIN = "admin"
    MODERATOR = "moderator"
    FINANCE_MANAGER = "finance_manager"


@dataclass
class Role:
    id: UUID
    name: str
    slug: str
    description: str | None
    created_at: datetime

    @classmethod
    def create(cls, name: str, slug: str, description: str | None = None) -> Role:
        return cls(id=uuid4(), name=name, slug=slug, description=description, created_at=datetime.now())
