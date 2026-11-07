from __future__ import annotations

from datetime import datetime
from uuid import UUID

from app.domain.entities.restaurant import Restaurant as RestaurantEntity
from app.domain.interfaces.repositories.restaurant_repository import RestaurantRepository


class CreateRestaurantUseCase:
    def __init__(self, restaurant_repo: RestaurantRepository) -> None:
        self._restaurant_repo = restaurant_repo

    async def execute(
        self,
        user_id: UUID,
        name: str,
        description: str | None = None,
        cuisine_type: str | None = None,
        address: str | None = None,
        phone: str | None = None,
        price_range: str | None = None,
        opening_hours: str | None = None,
        city_id: str | None = None,
    ) -> dict:
        profile = await self._restaurant_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Restaurant partner profile not found. Create one first.")

        restaurant = RestaurantEntity.create(
            partner_id=profile.id,
            name=name,
            description=description,
            cuisine_type=cuisine_type,
            address=address,
            phone=phone,
            price_range=price_range,
            opening_hours=opening_hours,
            city_id=UUID(city_id) if city_id else None,
        )
        await self._restaurant_repo.create_restaurant(restaurant)

        return _restaurant_to_dict(restaurant)


class UpdateRestaurantUseCase:
    def __init__(self, restaurant_repo: RestaurantRepository) -> None:
        self._restaurant_repo = restaurant_repo

    async def execute(
        self,
        restaurant_id: UUID,
        user_id: UUID,
        name: str | None = None,
        description: str | None = None,
        cuisine_type: str | None = None,
        address: str | None = None,
        phone: str | None = None,
        price_range: str | None = None,
        opening_hours: str | None = None,
        status: str | None = None,
        is_active: bool | None = None,
        city_id: str | None = None,
    ) -> dict:
        profile = await self._restaurant_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Restaurant partner profile not found")

        restaurant = await self._restaurant_repo.get_restaurant_by_id(restaurant_id)
        if not restaurant:
            raise ValueError("Restaurant not found")
        if restaurant.partner_id != profile.id:
            raise PermissionError("This restaurant does not belong to you")

        if name is not None:
            restaurant.name = name
        if description is not None:
            restaurant.description = description
        if cuisine_type is not None:
            restaurant.cuisine_type = cuisine_type
        if address is not None:
            restaurant.address = address
        if phone is not None:
            restaurant.phone = phone
        if price_range is not None:
            restaurant.price_range = price_range
        if opening_hours is not None:
            restaurant.opening_hours = opening_hours
        if status is not None:
            restaurant.status = status
        if is_active is not None:
            restaurant.is_active = is_active
        if city_id is not None:
            restaurant.city_id = UUID(city_id)

        restaurant.updated_at = datetime.now()
        await self._restaurant_repo.update_restaurant(restaurant)

        return _restaurant_to_dict(restaurant)


class ListMyRestaurantsUseCase:
    def __init__(self, restaurant_repo: RestaurantRepository) -> None:
        self._restaurant_repo = restaurant_repo

    async def execute(self, user_id: UUID, offset: int = 0, limit: int = 20) -> dict:
        profile = await self._restaurant_repo.get_profile_by_user_id(user_id)
        if not profile:
            return {"items": [], "total": 0}

        items, total = await self._restaurant_repo.get_restaurants_by_partner(profile.id, offset=offset, limit=limit)
        return {"items": [_restaurant_to_dict(r) for r in items], "total": total}


class ListRestaurantsUseCase:
    def __init__(self, restaurant_repo: RestaurantRepository) -> None:
        self._restaurant_repo = restaurant_repo

    async def execute(self, city_id: str | None = None, offset: int = 0, limit: int = 20) -> dict:
        city_uuid = UUID(city_id) if city_id else None
        items, total = await self._restaurant_repo.list_restaurants(city_id=city_uuid, offset=offset, limit=limit)
        return {"items": [_restaurant_to_dict(r) for r in items], "total": total}


class GetRestaurantUseCase:
    def __init__(self, restaurant_repo: RestaurantRepository) -> None:
        self._restaurant_repo = restaurant_repo

    async def execute(self, restaurant_id: UUID) -> dict:
        restaurant = await self._restaurant_repo.get_restaurant_by_id(restaurant_id)
        if not restaurant:
            raise ValueError("Restaurant not found")
        return _restaurant_to_dict(restaurant)


class DeleteRestaurantUseCase:
    def __init__(self, restaurant_repo: RestaurantRepository) -> None:
        self._restaurant_repo = restaurant_repo

    async def execute(self, restaurant_id: UUID, user_id: UUID) -> None:
        profile = await self._restaurant_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Restaurant partner profile not found")

        restaurant = await self._restaurant_repo.get_restaurant_by_id(restaurant_id)
        if not restaurant:
            raise ValueError("Restaurant not found")
        if restaurant.partner_id != profile.id:
            raise PermissionError("This restaurant does not belong to you")

        await self._restaurant_repo.delete_restaurant(restaurant_id)


class GetPartnerDashboardUseCase:
    def __init__(self, restaurant_repo: RestaurantRepository) -> None:
        self._restaurant_repo = restaurant_repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._restaurant_repo.get_profile_by_user_id(user_id)
        if not profile:
            return {"profile": None, "restaurants_count": 0, "active_restaurants": 0}

        items, _ = await self._restaurant_repo.get_restaurants_by_partner(profile.id, limit=1000)
        restaurants = [_restaurant_to_dict(r) for r in items]
        active = [r for r in restaurants if r["is_active"]]

        return {
            "profile": {
                "id": str(profile.id),
                "restaurant_name": profile.restaurant_name,
                "description": profile.description,
                "cuisine_type": profile.cuisine_type,
                "is_approved": profile.is_approved,
            },
            "restaurants_count": len(restaurants),
            "active_restaurants": len(active),
            "restaurants": restaurants,
        }

def _restaurant_to_dict(r: RestaurantEntity) -> dict:
    return {
        "id": str(r.id),
        "partner_id": str(r.partner_id),
        "name": r.name,
        "description": r.description,
        "cuisine_type": r.cuisine_type,
        "address": r.address,
        "phone": r.phone,
        "price_range": r.price_range,
        "opening_hours": r.opening_hours,
        "city_id": str(r.city_id) if r.city_id else None,
        "status": r.status,
        "is_active": r.is_active,
        "created_at": r.created_at.isoformat(),
        "updated_at": r.updated_at.isoformat(),
    }
