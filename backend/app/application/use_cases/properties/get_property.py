from __future__ import annotations

from uuid import UUID

from app.application.dto.property_dto import CategoryResponse, CityResponse, PropertyResponse
from app.domain.interfaces.repositories.property_repository import PropertyRepository


class GetPropertyUseCase:
    def __init__(self, property_repo: PropertyRepository) -> None:
        self._property_repo = property_repo

    async def execute(self, property_id: UUID) -> PropertyResponse:
        property = await self._property_repo.get_by_id(property_id)
        if not property:
            raise ValueError("Property not found")

        return PropertyResponse(
            id=str(property.id),
            title=property.title,
            description=property.description,
            category=CategoryResponse(
                id=str(property.category_id),
                name=property.category_name or "",
                slug=property.category_slug or "",
            ) if property.category_name else None,
            city=CityResponse(
                id=str(property.city_id),
                name=property.city_name or "",
                slug=property.city_slug or "",
            ) if property.city_name else None,
            status=property.status,
            full_address=property.address.full_address,
            price_per_night=float(property.price_per_night.amount),
            currency=property.price_per_night.currency,
            max_guests=property.max_guests,
            bedrooms=property.bedrooms,
            beds=property.beds,
            bathrooms=property.bathrooms,
            check_in_time=property.check_in_time,
            check_out_time=property.check_out_time,
            instagram=property.instagram,
            telegram=property.telegram,
            whatsapp=property.whatsapp,
            rating_points=property.rating_points,
            stages=property.stages,
            amenities=property.amenities,
            images=[m.url for m in property.media],
            owner_id=str(property.owner_id),
            is_active=property.is_active,
            created_at=property.created_at.isoformat(),
        )
