from __future__ import annotations

from uuid import UUID

from app.application.dto.property_dto import CategoryResponse, CityResponse, PropertyListResponse, PropertyResponse
from app.domain.interfaces.repositories.property_repository import PropertyRepository


class SearchPropertiesUseCase:
    def __init__(self, property_repo: PropertyRepository) -> None:
        self._property_repo = property_repo

    async def execute(
        self,
        query: str | None = None,
        category_id: UUID | None = None,
        city_id: UUID | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        max_guests: int | None = None,
        amenity_slugs: list[str] | None = None,
        sort_by: str = "rating_points",
        offset: int = 0,
        limit: int = 20,
    ) -> PropertyListResponse:
        items, total = await self._property_repo.search(
            query=query,
            category_id=category_id,
            city_id=city_id,
            min_price=min_price,
            max_price=max_price,
            max_guests=max_guests,
            amenity_slugs=amenity_slugs,
            sort_by=sort_by,
            offset=offset,
            limit=limit,
        )

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
                    rating_points=p.rating_points,
                    stages=p.stages,
                    amenities=p.amenities,
                    images=[m.url for m in p.media],
                    owner_id=str(p.owner_id),
                    is_active=p.is_active,
                    created_at=p.created_at.isoformat(),
                )
                for p in items
            ],
            total=total,
            offset=offset,
            limit=limit,
        )
