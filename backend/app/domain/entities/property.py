from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4

from app.domain.value_objects.address import Address
from app.domain.value_objects.money import Money


class PropertyStatus:
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


@dataclass
class PropertyMedia:
    id: UUID
    property_id: UUID
    url: str
    is_primary: bool
    order: int
    created_at: datetime


@dataclass
class Property:
    id: UUID
    owner_id: UUID
    category_id: UUID
    city_id: UUID
    title: str
    description: str
    status: str
    address: Address
    price_per_night: Money
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: int
    check_in_time: str | None
    check_out_time: str | None
    amenities: list[str]
    media: list[PropertyMedia]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    instagram: str | None = None
    telegram: str | None = None
    whatsapp: str | None = None
    rating_points: int = 0
    stages: int = 0
    category_name: str | None = None
    category_slug: str | None = None
    city_name: str | None = None
    city_slug: str | None = None

    @classmethod
    def create(
        cls,
        owner_id: UUID,
        category_id: UUID,
        city_id: UUID,
        title: str,
        description: str,
        address: Address,
        price_per_night: Money,
        max_guests: int,
        bedrooms: int = 1,
        beds: int = 1,
        bathrooms: int = 1,
        check_in_time: str | None = None,
        check_out_time: str | None = None,
        amenities: list[str] | None = None,
    ) -> Property:
        now = datetime.now()
        return cls(
            id=uuid4(),
            owner_id=owner_id,
            category_id=category_id,
            city_id=city_id,
            title=title,
            description=description,
            status=PropertyStatus.DRAFT,
            address=address,
            price_per_night=price_per_night,
            max_guests=max_guests,
            bedrooms=bedrooms,
            beds=beds,
            bathrooms=bathrooms,
            check_in_time=check_in_time,
            check_out_time=check_out_time,
            amenities=amenities or [],
            media=[],
            is_active=True,
            rating_points=0,
            stages=0,
            created_at=now,
            updated_at=now,
        )
