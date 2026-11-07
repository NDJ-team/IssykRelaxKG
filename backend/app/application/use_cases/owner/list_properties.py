from __future__ import annotations

from uuid import UUID

from app.application.dto.property_dto import CategoryResponse, CityResponse, PropertyListResponse, PropertyResponse
from app.domain.interfaces.repositories.property_repository import PropertyRepository


class ListOwnerPropertiesUseCase:
    def __init__(self, property_repo: PropertyRepository) -> None:
        self._property_repo = property_repo

    async def execute(self, owner_id: UUID, offset: int = 0, limit: int = 20) -> PropertyListResponse:
        items = await self._property_repo.get_by_owner(owner_id, offset=offset, limit=limit)

        return PropertyListResponse(
            items=[
                PropertyResponse(
                    id=str(p.id),
                    title=p.title,
                    description=p.description,
                    category=CategoryResponse(
                        id=str(p.category_id),
                        name=p.category_name or "",
                        slug=p.category_slug or "",
                    ) if p.category_name else None,
                    city=CityResponse(
                        id=str(p.city_id),
                        name=p.city_name or "",
                        slug=p.city_slug or "",
                    ) if p.city_name else None,
                    status=p.status,
                    full_address=p.address.full_address,
                    price_per_night=float(p.price_per_night.amount),
                    currency=p.price_per_night.currency,
                    max_guests=p.max_guests,
                    bedrooms=p.bedrooms,
                    beds=p.beds,
                    bathrooms=p.bathrooms,
                    check_in_time=p.check_in_time,
                    check_out_time=p.check_out_time,
                    instagram=p.instagram,
                    telegram=p.telegram,
                    whatsapp=p.whatsapp,
                    amenities=p.amenities,
                    images=[m.url for m in p.media],
                    owner_id=str(p.owner_id),
                    is_active=p.is_active,
                    created_at=p.created_at.isoformat(),
                )
                for p in items
            ],
            total=len(items),
            offset=offset,
            limit=limit,
        )
