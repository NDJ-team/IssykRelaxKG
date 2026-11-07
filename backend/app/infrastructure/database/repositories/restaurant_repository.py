from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.restaurant import Restaurant as RestaurantEntity
from app.domain.entities.restaurant_partner_profile import RestaurantPartnerProfile as RestaurantPartnerProfileEntity
from app.domain.interfaces.repositories.restaurant_repository import RestaurantRepository
from app.infrastructure.database.models.restaurant import RestaurantModel
from app.infrastructure.database.models.restaurant_partner_profile import RestaurantPartnerProfileModel


class SQLAlchemyRestaurantRepository(RestaurantRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_profile(self, profile: RestaurantPartnerProfileEntity) -> RestaurantPartnerProfileEntity:
        model = RestaurantPartnerProfileModel(
            id=profile.id,
            user_id=profile.user_id,
            restaurant_name=profile.restaurant_name,
            description=profile.description,
            cuisine_type=profile.cuisine_type,
            address=profile.address,
            phone=profile.phone,
            is_approved=profile.is_approved,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return profile

    async def get_profile_by_user_id(self, user_id: UUID) -> RestaurantPartnerProfileEntity | None:
        result = await self._session.execute(
            select(RestaurantPartnerProfileModel).where(RestaurantPartnerProfileModel.user_id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._profile_to_entity(model) if model else None

    async def get_profile_by_id(self, profile_id: UUID) -> RestaurantPartnerProfileEntity | None:
        result = await self._session.execute(
            select(RestaurantPartnerProfileModel).where(RestaurantPartnerProfileModel.id == profile_id)
        )
        model = result.scalar_one_or_none()
        return self._profile_to_entity(model) if model else None

    async def update_profile(self, profile: RestaurantPartnerProfileEntity) -> RestaurantPartnerProfileEntity:
        result = await self._session.execute(
            select(RestaurantPartnerProfileModel).where(RestaurantPartnerProfileModel.id == profile.id)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Restaurant partner profile not found")
        model.restaurant_name = profile.restaurant_name
        model.description = profile.description
        model.cuisine_type = profile.cuisine_type
        model.address = profile.address
        model.phone = profile.phone
        model.is_approved = profile.is_approved
        model.updated_at = profile.updated_at
        await self._session.flush()
        return profile

    async def create_restaurant(self, restaurant: RestaurantEntity) -> RestaurantEntity:
        model = RestaurantModel(
            id=restaurant.id,
            partner_id=restaurant.partner_id,
            name=restaurant.name,
            description=restaurant.description,
            cuisine_type=restaurant.cuisine_type,
            address=restaurant.address,
            phone=restaurant.phone,
            price_range=restaurant.price_range,
            opening_hours=restaurant.opening_hours,
            city_id=restaurant.city_id,
            status=restaurant.status,
            is_active=restaurant.is_active,
            created_at=restaurant.created_at,
            updated_at=restaurant.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return restaurant

    async def get_restaurant_by_id(self, restaurant_id: UUID) -> RestaurantEntity | None:
        result = await self._session.execute(select(RestaurantModel).where(RestaurantModel.id == restaurant_id))
        model = result.scalar_one_or_none()
        return self._restaurant_to_entity(model) if model else None

    async def get_restaurants_by_partner(self, partner_profile_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[RestaurantEntity], int]:
        base = select(RestaurantModel).where(RestaurantModel.partner_id == partner_profile_id)
        return await self._paginate_restaurants(base, offset, limit)

    async def list_restaurants(self, city_id: UUID | None = None, offset: int = 0, limit: int = 20) -> tuple[list[RestaurantEntity], int]:
        base = select(RestaurantModel).where(RestaurantModel.is_active == True, RestaurantModel.status == "approved")
        if city_id:
            base = base.where(RestaurantModel.city_id == city_id)
        return await self._paginate_restaurants(base, offset, limit)

    async def update_restaurant(self, restaurant: RestaurantEntity) -> RestaurantEntity:
        result = await self._session.execute(select(RestaurantModel).where(RestaurantModel.id == restaurant.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Restaurant not found")
        model.name = restaurant.name
        model.description = restaurant.description
        model.cuisine_type = restaurant.cuisine_type
        model.address = restaurant.address
        model.phone = restaurant.phone
        model.price_range = restaurant.price_range
        model.opening_hours = restaurant.opening_hours
        model.city_id = restaurant.city_id
        model.status = restaurant.status
        model.is_active = restaurant.is_active
        model.updated_at = restaurant.updated_at
        await self._session.flush()
        return restaurant

    async def delete_restaurant(self, restaurant_id: UUID) -> None:
        result = await self._session.execute(select(RestaurantModel).where(RestaurantModel.id == restaurant_id))
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    async def _paginate_restaurants(self, base, offset: int, limit: int) -> tuple[list[RestaurantEntity], int]:
        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(base.order_by(RestaurantModel.created_at.desc()).offset(offset).limit(limit))
        return [self._restaurant_to_entity(m) for m in result.scalars().all()], total

    def _profile_to_entity(self, model: RestaurantPartnerProfileModel) -> RestaurantPartnerProfileEntity:
        return RestaurantPartnerProfileEntity(
            id=model.id,
            user_id=model.user_id,
            restaurant_name=model.restaurant_name,
            description=model.description,
            cuisine_type=model.cuisine_type,
            address=model.address,
            phone=model.phone,
            is_approved=model.is_approved,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _restaurant_to_entity(self, model: RestaurantModel) -> RestaurantEntity:
        return RestaurantEntity(
            id=model.id,
            partner_id=model.partner_id,
            name=model.name,
            description=model.description,
            cuisine_type=model.cuisine_type,
            address=model.address,
            phone=model.phone,
            price_range=model.price_range,
            opening_hours=model.opening_hours,
            city_id=model.city_id,
            status=model.status,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
