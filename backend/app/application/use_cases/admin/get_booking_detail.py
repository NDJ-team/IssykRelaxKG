from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.admin_dto import AdminBookingDetailResponse
from app.infrastructure.database.models.amenity import AmenityModel, PropertyAmenityModel
from app.infrastructure.database.models.booking import BookingModel
from app.infrastructure.database.models.category import CategoryModel
from app.infrastructure.database.models.city import CityModel
from app.infrastructure.database.models.property import PropertyMediaModel, PropertyModel
from app.infrastructure.database.models.user import UserModel


class AdminGetBookingDetailUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(self, booking_id: UUID) -> AdminBookingDetailResponse:
        result = await self._session.execute(
            select(BookingModel).where(BookingModel.id == booking_id)
        )
        m = result.scalar_one_or_none()
        if not m:
            raise ValueError("Booking not found")

        prop_result = await self._session.execute(
            select(PropertyModel).where(PropertyModel.id == m.property_id)
        )
        prop = prop_result.scalar_one_or_none()

        guest_result = await self._session.execute(
            select(UserModel).where(UserModel.id == m.guest_id)
        )
        guest = guest_result.scalar_one_or_none()

        owner_result = await self._session.execute(
            select(UserModel).where(UserModel.id == m.owner_id)
        )
        owner = owner_result.scalar_one_or_none()

        cat_name = ""
        city_name = ""
        address = ""
        price_per_night = 0.0
        max_guests = 0
        bedrooms = 0
        beds = 0
        bathrooms = 0
        amenities = []
        images = []

        if prop:
            price_per_night = float(prop.price_per_night)
            max_guests = prop.max_guests
            bedrooms = prop.bedrooms
            beds = prop.beds
            bathrooms = prop.bathrooms

            cat_result = await self._session.execute(
                select(CategoryModel).where(CategoryModel.id == prop.category_id)
            )
            cat = cat_result.scalar_one_or_none()
            cat_name = cat.name if cat else ""

            city_result = await self._session.execute(
                select(CityModel).where(CityModel.id == prop.city_id)
            )
            c = city_result.scalar_one_or_none()
            city_name = c.name if c else ""

            parts = [p for p in [prop.country, prop.district, prop.street, prop.building] if p]
            address = ", ".join(parts)

            am_result = await self._session.execute(
                select(AmenityModel.name)
                .join(PropertyAmenityModel, PropertyAmenityModel.amenity_id == AmenityModel.id)
                .where(PropertyAmenityModel.property_id == prop.id)
            )
            amenities = [row[0] for row in am_result.all()]

            img_result = await self._session.execute(
                select(PropertyMediaModel)
                .where(PropertyMediaModel.property_id == prop.id)
                .order_by(PropertyMediaModel.order)
            )
            for img in img_result.scalars().all():
                images.append({"url": img.url, "is_primary": img.is_primary})

        return AdminBookingDetailResponse(
            id=str(m.id),
            property_id=str(m.property_id),
            property_title=prop.title if prop else "",
            property_category=cat_name,
            property_city=city_name,
            property_address=address,
            property_price_per_night=price_per_night,
            property_max_guests=max_guests,
            property_bedrooms=bedrooms,
            property_beds=beds,
            property_bathrooms=bathrooms,
            property_amenities=amenities,
            property_images=images,
            guest_id=str(m.guest_id),
            guest_name=guest.full_name if guest else "",
            guest_email=guest.email if guest else "",
            guest_phone=guest.phone if guest else "",
            owner_id=str(m.owner_id),
            owner_name=owner.full_name if owner else "",
            owner_email=owner.email if owner else "",
            owner_phone=owner.phone if owner else "",
            check_in=m.check_in.isoformat(),
            check_out=m.check_out.isoformat(),
            total_price=float(m.total_price),
            status=m.status,
            guest_count=m.guest_count,
            special_requests=m.special_requests,
            verification_code=m.verification_code,
            guest_confirmed=bool(m.guest_confirmed),
            owner_confirmed=bool(m.owner_confirmed),
            created_at=m.created_at.isoformat(),
            updated_at=m.updated_at.isoformat(),
        )
