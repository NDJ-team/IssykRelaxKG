from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from app.application.dto.property_dto import CategoryResponse, CityResponse, CreatePropertyRequest, PropertyResponse
from app.domain.entities.property import Property, PropertyMedia
from app.domain.interfaces.repositories.property_repository import PropertyRepository
from app.domain.value_objects.address import Address
from app.domain.value_objects.money import Money


class CreatePropertyUseCase:
    def __init__(self, property_repo: PropertyRepository) -> None:
        self._property_repo = property_repo

    async def execute(self, request: CreatePropertyRequest, owner_id: UUID) -> PropertyResponse:
        address = Address(
            country=request.country,
            city="",
            district=request.district,
            street=request.street,
            building=request.building,
            postal_code=request.postal_code,
            latitude=request.latitude,
            longitude=request.longitude,
        )

        property = Property.create(
            owner_id=owner_id,
            category_id=UUID(request.category_id),
            city_id=UUID(request.city_id),
            title=request.title,
            description=request.description,
            address=address,
            price_per_night=Money(amount=Decimal(str(request.price_per_night)), currency=request.currency),
            max_guests=request.max_guests,
            bedrooms=request.bedrooms,
            beds=request.beds,
            bathrooms=request.bathrooms,
            check_in_time=request.check_in_time,
            check_out_time=request.check_out_time,
            amenities=request.amenities,
        )

        property.instagram = request.instagram
        property.telegram = request.telegram
        property.whatsapp = request.whatsapp

        if request.images:
            property.media = [
                PropertyMedia(
                    id=uuid4(),
                    property_id=property.id,
                    url=url,
                    is_primary=i == 0,
                    order=i,
                    created_at=datetime.now(),
                )
                for i, url in enumerate(request.images)
            ]

        await self._property_repo.create(property)

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
            amenities=property.amenities,
            images=[m.url for m in property.media],
            owner_id=str(property.owner_id),
            is_active=property.is_active,
            created_at=property.created_at.isoformat(),
        )
