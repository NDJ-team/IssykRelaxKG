from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4


@dataclass
class LocalHostProfile:
    id: UUID
    user_id: UUID
    bio: str | None
    experience_years: int | None
    languages: str | None
    is_approved: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(
        cls,
        user_id: UUID,
        bio: str | None = None,
        experience_years: int | None = None,
        languages: str | None = None,
    ) -> LocalHostProfile:
        now = datetime.now()
        return cls(
            id=uuid4(),
            user_id=user_id,
            bio=bio,
            experience_years=experience_years,
            languages=languages,
            is_approved=False,
            created_at=now,
            updated_at=now,
        )


@dataclass
class LocalExperience:
    id: UUID
    host_id: UUID
    title: str
    description: str | None
    category: str
    price: Decimal
    currency: str
    duration_minutes: int | None
    max_guests: int
    city_id: UUID | None
    address: str | None
    latitude: Decimal | None
    longitude: Decimal | None
    images: list[str]
    includes: str | None
    languages: str | None
    status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    city_name: str | None = None
    city_slug: str | None = None

    @classmethod
    def create(
        cls,
        host_id: UUID,
        title: str,
        category: str,
        price: Decimal,
        description: str | None = None,
        currency: str = "KGS",
        duration_minutes: int | None = None,
        max_guests: int = 6,
        city_id: UUID | None = None,
        address: str | None = None,
        latitude: Decimal | None = None,
        longitude: Decimal | None = None,
        images: list[str] | None = None,
        includes: str | None = None,
        languages: str | None = None,
    ) -> LocalExperience:
        now = datetime.now()
        return cls(
            id=uuid4(),
            host_id=host_id,
            title=title,
            description=description,
            category=category,
            price=price,
            currency=currency,
            duration_minutes=duration_minutes,
            max_guests=max_guests,
            city_id=city_id,
            address=address,
            latitude=latitude,
            longitude=longitude,
            images=images or [],
            includes=includes,
            languages=languages,
            status="pending",
            is_active=True,
            created_at=now,
            updated_at=now,
        )
