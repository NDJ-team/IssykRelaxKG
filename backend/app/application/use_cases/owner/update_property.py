from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from app.application.dto.property_dto import PropertyResponse, UpdatePropertyRequest
from app.domain.interfaces.repositories.property_repository import PropertyRepository
from app.domain.value_objects.address import Address
from app.domain.value_objects.money import Money


class UpdatePropertyUseCase:
    def __init__(self, property_repo: PropertyRepository) -> None:
        self._property_repo = property_repo

    async def execute(self, property_id: UUID, owner_id: UUID, request: UpdatePropertyRequest) -> PropertyResponse:
        property = await self._property_repo.get_by_id(property_id)
        if not property:
            raise ValueError("Property not found")
        if property.owner_id != owner_id:
            raise PermissionError("You can only update your own properties")

        if request.title is not None:
            property.title = request.title
        if request.description is not None:
            property.description = request.description
        if request.category_id is not None:
            property.category_id = UUID(request.category_id)
        if request.city_id is not None:
            property.city_id = UUID(request.city_id)
        if request.country is not None:
            property.address = Address(
                country=request.country,
                city=property.address.city,
                district=request.district if request.district is not None else property.address.district,
                street=request.street if request.street is not None else property.address.street,
                building=request.building if request.building is not None else property.address.building,
                postal_code=request.postal_code if request.postal_code is not None else property.address.postal_code,
                latitude=request.latitude if request.latitude is not None else property.address.latitude,
                longitude=request.longitude if request.longitude is not None else property.address.longitude,
            )
        if request.price_per_night is not None:
            property.price_per_night = Money(
                amount=Decimal(str(request.price_per_night)),
                currency=request.currency or property.price_per_night.currency,
            )
        if request.max_guests is not None:
            property.max_guests = request.max_guests
        if request.bedrooms is not None:
            property.bedrooms = request.bedrooms
        if request.beds is not None:
            property.beds = request.beds
        if request.bathrooms is not None:
            property.bathrooms = request.bathrooms
        if request.check_in_time is not None:
            property.check_in_time = request.check_in_time
        if request.check_out_time is not None:
            property.check_out_time = request.check_out_time
        if request.instagram is not None:
            property.instagram = request.instagram
        if request.telegram is not None:
            property.telegram = request.telegram
        if request.whatsapp is not None:
            property.whatsapp = request.whatsapp
        if request.amenities is not None:
            property.amenities = request.amenities
        if request.is_active is not None:
            property.is_active = request.is_active

        await self._property_repo.update(property)

        return PropertyResponse(
            id=str(property.id),
            title=property.title,
            description=property.description,
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
