from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.admin_dto import AdminPropertyDetailResponse
from app.infrastructure.database.models.amenity import AmenityModel, PropertyAmenityModel
from app.infrastructure.database.models.booking import BookingModel
from app.infrastructure.database.models.category import CategoryModel
from app.infrastructure.database.models.city import CityModel
from app.infrastructure.database.models.property import PropertyMediaModel, PropertyModel
from app.infrastructure.database.models.user import UserModel


class AdminGetPropertyDetailUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(self, property_id: UUID) -> AdminPropertyDetailResponse:
        result = await self._session.execute(
            select(PropertyModel).where(PropertyModel.id == property_id)
        )
        m = result.scalar_one_or_none()
        if not m:
            raise ValueError("Property not found")

        owner_result = await self._session.execute(
            select(UserModel).where(UserModel.id == m.owner_id)
        )
        owner = owner_result.scalar_one_or_none()

        cat_result = await self._session.execute(
            select(CategoryModel).where(CategoryModel.id == m.category_id)
        )
        cat = cat_result.scalar_one_or_none()

        city_result = await self._session.execute(
            select(CityModel).where(CityModel.id == m.city_id)
        )
        c = city_result.scalar_one_or_none()

        am_result = await self._session.execute(
            select(AmenityModel.name)
            .join(PropertyAmenityModel, PropertyAmenityModel.amenity_id == AmenityModel.id)
            .where(PropertyAmenityModel.property_id == m.id)
        )
        amenities = [row[0] for row in am_result.all()]

        img_result = await self._session.execute(
            select(PropertyMediaModel)
            .where(PropertyMediaModel.property_id == m.id)
            .order_by(PropertyMediaModel.order)
        )
        images = []
        for img in img_result.scalars().all():
            images.append({"url": img.url, "is_primary": img.is_primary})

        count_result = await self._session.execute(
            select(func.count()).select_from(BookingModel).where(BookingModel.property_id == m.id)
        )
        booking_count = count_result.scalar() or 0

        parts = [p for p in [m.country, m.district, m.street, m.building] if p]
        address = ", ".join(parts)

        return AdminPropertyDetailResponse(
            id=str(m.id),
            title=m.title,
            description=m.description,
            owner_id=str(m.owner_id),
            owner_name=owner.full_name if owner else "",
            owner_email=owner.email if owner else "",
            category=cat.name if cat else "",
            city=c.name if c else "",
            address=address,
            status=m.status,
            price_per_night=float(m.price_per_night),
            currency=m.currency,
            max_guests=m.max_guests,
            bedrooms=m.bedrooms,
            beds=m.beds,
            bathrooms=m.bathrooms,
            check_in_time=m.check_in_time,
            check_out_time=m.check_out_time,
            amenities=amenities,
            images=images,
            instagram=m.instagram,
            telegram=m.telegram,
            whatsapp=m.whatsapp,
            is_active=m.is_active,
            booking_count=booking_count,
            created_at=m.created_at.isoformat(),
            updated_at=m.updated_at.isoformat(),
        )
