from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.property import Property as PropertyEntity
from app.domain.entities.property import PropertyMedia as PropertyMediaEntity
from app.domain.interfaces.repositories.property_repository import PropertyRepository
from app.domain.value_objects.address import Address
from app.domain.value_objects.money import Money
from app.infrastructure.database.models.amenity import AmenityModel, PropertyAmenityModel
from app.infrastructure.database.models.category import CategoryModel
from app.infrastructure.database.models.city import CityModel
from app.infrastructure.database.models.property import PropertyMediaModel, PropertyModel


class SQLAlchemyPropertyRepository(PropertyRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, property: PropertyEntity) -> PropertyEntity:
        model = PropertyModel(
            id=property.id,
            owner_id=property.owner_id,
            category_id=property.category_id,
            city_id=property.city_id,
            title=property.title,
            description=property.description,
            status=property.status,
            country=property.address.country,
            district=property.address.district,
            street=property.address.street,
            building=property.address.building,
            postal_code=property.address.postal_code,
            latitude=property.address.latitude,
            longitude=property.address.longitude,
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
            is_active=property.is_active,
            created_at=property.created_at,
            updated_at=property.updated_at,
        )
        self._session.add(model)
        await self._session.flush()

        if property.amenities:
            await self._sync_amenities(model.id, property.amenities)

        if property.media:
            for m in property.media:
                media_model = PropertyMediaModel(
                    id=m.id,
                    property_id=model.id,
                    url=m.url,
                    is_primary=m.is_primary,
                    order=m.order,
                    created_at=m.created_at,
                )
                self._session.add(media_model)
            await self._session.flush()

        return property

    async def get_by_id(self, property_id: UUID) -> PropertyEntity | None:
        result = await self._session.execute(select(PropertyModel).where(PropertyModel.id == property_id))
        model = result.scalar_one_or_none()
        return await self._to_entity(model) if model else None

    async def get_by_owner(self, owner_id: UUID, offset: int = 0, limit: int = 20) -> list[PropertyEntity]:
        result = await self._session.execute(
            select(PropertyModel)
            .where(PropertyModel.owner_id == owner_id)
            .order_by(PropertyModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        models = result.scalars().all()
        return [await self._to_entity(m) for m in models]

    async def search(
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
    ) -> tuple[list[PropertyEntity], int]:
        stmt = select(PropertyModel).where(PropertyModel.is_active, PropertyModel.status == "published")

        if query:
            stmt = stmt.where(
                or_(
                    PropertyModel.title.ilike(f"%{query}%"),
                    PropertyModel.description.ilike(f"%{query}%"),
                )
            )
        if category_id:
            stmt = stmt.where(PropertyModel.category_id == category_id)
        if city_id:
            stmt = stmt.where(PropertyModel.city_id == city_id)
        if min_price is not None:
            stmt = stmt.where(PropertyModel.price_per_night >= min_price)
        if max_price is not None:
            stmt = stmt.where(PropertyModel.price_per_night <= max_price)
        if max_guests is not None:
            stmt = stmt.where(PropertyModel.max_guests >= max_guests)
        if amenity_slugs:
            amenity_subq = (
                select(PropertyAmenityModel.property_id)
                .join(AmenityModel)
                .where(AmenityModel.slug.in_(amenity_slugs))
                .group_by(PropertyAmenityModel.property_id)
                .having(func.count(PropertyAmenityModel.amenity_id) == len(amenity_slugs))
            )
            stmt = stmt.where(PropertyModel.id.in_(amenity_subq))

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await self._session.execute(count_stmt)
        total = total_result.scalar() or 0

        if sort_by == "rating_points":
            stmt = stmt.order_by(PropertyModel.rating_points.desc(), PropertyModel.created_at.desc())
        elif sort_by == "price_asc":
            stmt = stmt.order_by(PropertyModel.price_per_night.asc())
        elif sort_by == "price_desc":
            stmt = stmt.order_by(PropertyModel.price_per_night.desc())
        else:
            stmt = stmt.order_by(PropertyModel.created_at.desc())

        stmt = stmt.offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        models = result.scalars().all()

        entities = [await self._to_entity(m) for m in models]
        return entities, total

    async def update(self, property: PropertyEntity) -> PropertyEntity:
        result = await self._session.execute(select(PropertyModel).where(PropertyModel.id == property.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Property not found")

        model.title = property.title
        model.description = property.description
        model.category_id = property.category_id
        model.city_id = property.city_id
        model.status = property.status
        model.country = property.address.country
        model.district = property.address.district
        model.street = property.address.street
        model.building = property.address.building
        model.postal_code = property.address.postal_code
        model.latitude = property.address.latitude
        model.longitude = property.address.longitude
        model.price_per_night = float(property.price_per_night.amount)
        model.currency = property.price_per_night.currency
        model.max_guests = property.max_guests
        model.bedrooms = property.bedrooms
        model.beds = property.beds
        model.bathrooms = property.bathrooms
        model.check_in_time = property.check_in_time
        model.check_out_time = property.check_out_time
        model.instagram = property.instagram
        model.telegram = property.telegram
        model.whatsapp = property.whatsapp
        model.is_active = property.is_active
        model.updated_at = property.updated_at
        await self._session.flush()

        await self._sync_amenities(model.id, property.amenities)
        return property

    async def delete(self, property_id: UUID) -> None:
        result = await self._session.execute(select(PropertyModel).where(PropertyModel.id == property_id))
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    async def add_rating_points(self, property_id: UUID, delta: int) -> None:
        result = await self._session.execute(
            select(PropertyModel).where(PropertyModel.id == property_id)
        )
        model = result.scalar_one_or_none()
        if model:
            model.rating_points = (model.rating_points or 0) + delta
            await self._session.flush()

    async def get_by_ids(self, property_ids: list[UUID]) -> list[PropertyEntity]:
        result = await self._session.execute(
            select(PropertyModel).where(PropertyModel.id.in_(property_ids))
        )
        models = result.scalars().all()
        return [await self._to_entity(m) for m in models]

    async def _sync_amenities(self, property_id: UUID, amenity_slugs: list[str]) -> None:
        await self._session.execute(
            delete(PropertyAmenityModel).where(PropertyAmenityModel.property_id == property_id)
        )
        if not amenity_slugs:
            return

        result = await self._session.execute(
            select(AmenityModel).where(AmenityModel.slug.in_(amenity_slugs))
        )
        amenities = result.scalars().all()
        for amenity in amenities:
            self._session.add(PropertyAmenityModel(property_id=property_id, amenity_id=amenity.id))
        await self._session.flush()

    async def _to_entity(self, model: PropertyModel) -> PropertyEntity:
        media_result = await self._session.execute(
            select(PropertyMediaModel).where(PropertyMediaModel.property_id == model.id).order_by(PropertyMediaModel.order)
        )
        media_models = media_result.scalars().all()

        amenity_result = await self._session.execute(
            select(AmenityModel).join(PropertyAmenityModel).where(PropertyAmenityModel.property_id == model.id)
        )
        amenity_slugs = [a.slug for a in amenity_result.scalars().all()]

        category_result = await self._session.execute(select(CategoryModel).where(CategoryModel.id == model.category_id))
        category = category_result.scalar_one_or_none()
        city_result = await self._session.execute(select(CityModel).where(CityModel.id == model.city_id))
        city = city_result.scalar_one_or_none()

        return PropertyEntity(
            id=model.id,
            owner_id=model.owner_id,
            category_id=model.category_id,
            city_id=model.city_id,
            title=model.title,
            description=model.description,
            status=model.status,
            address=Address(
                country=model.country,
                city=city.name if city else "",
                district=model.district,
                street=model.street,
                building=model.building,
                postal_code=model.postal_code,
                latitude=float(model.latitude) if model.latitude else None,
                longitude=float(model.longitude) if model.longitude else None,
            ),
            price_per_night=Money(amount=Decimal(str(model.price_per_night)), currency=model.currency),
            max_guests=model.max_guests,
            bedrooms=model.bedrooms,
            beds=model.beds,
            bathrooms=model.bathrooms,
            check_in_time=model.check_in_time,
            check_out_time=model.check_out_time,
            instagram=model.instagram,
            telegram=model.telegram,
            whatsapp=model.whatsapp,
            rating_points=model.rating_points,
            stages=model.stages,
            amenities=amenity_slugs,
            media=[
                PropertyMediaEntity(
                    id=m.id,
                    property_id=m.property_id,
                    url=m.url,
                    is_primary=m.is_primary,
                    order=m.order,
                    created_at=m.created_at,
                )
                for m in media_models
            ],
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
            category_name=category.name if category else None,
            category_slug=category.slug if category else None,
            city_name=city.name if city else None,
            city_slug=city.slug if city else None,
        )
