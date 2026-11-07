from __future__ import annotations

from datetime import datetime
from uuid import UUID

from app.domain.entities.restaurant_partner_profile import RestaurantPartnerProfile as RestaurantPartnerProfileEntity
from app.domain.interfaces.repositories.restaurant_repository import RestaurantRepository


class CreateRestaurantPartnerProfileUseCase:
    def __init__(self, restaurant_repo: RestaurantRepository) -> None:
        self._restaurant_repo = restaurant_repo

    async def execute(
        self,
        user_id: UUID,
        restaurant_name: str,
        description: str | None = None,
        cuisine_type: str | None = None,
        address: str | None = None,
        phone: str | None = None,
    ) -> dict:
        existing = await self._restaurant_repo.get_profile_by_user_id(user_id)
        if existing:
            raise ValueError("Restaurant partner profile already exists")

        profile = RestaurantPartnerProfileEntity.create(
            user_id=user_id,
            restaurant_name=restaurant_name,
            description=description,
            cuisine_type=cuisine_type,
            address=address,
            phone=phone,
        )
        await self._restaurant_repo.create_profile(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "restaurant_name": profile.restaurant_name,
            "description": profile.description,
            "cuisine_type": profile.cuisine_type,
            "address": profile.address,
            "phone": profile.phone,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
        }


class UpdateRestaurantPartnerProfileUseCase:
    def __init__(self, restaurant_repo: RestaurantRepository) -> None:
        self._restaurant_repo = restaurant_repo

    async def execute(
        self,
        user_id: UUID,
        restaurant_name: str | None = None,
        description: str | None = None,
        cuisine_type: str | None = None,
        address: str | None = None,
        phone: str | None = None,
    ) -> dict:
        profile = await self._restaurant_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Restaurant partner profile not found. Create one first.")

        if restaurant_name is not None:
            profile.restaurant_name = restaurant_name
        if description is not None:
            profile.description = description
        if cuisine_type is not None:
            profile.cuisine_type = cuisine_type
        if address is not None:
            profile.address = address
        if phone is not None:
            profile.phone = phone
        profile.updated_at = datetime.now()

        await self._restaurant_repo.update_profile(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "restaurant_name": profile.restaurant_name,
            "description": profile.description,
            "cuisine_type": profile.cuisine_type,
            "address": profile.address,
            "phone": profile.phone,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }


class GetRestaurantPartnerProfileUseCase:
    def __init__(self, restaurant_repo: RestaurantRepository) -> None:
        self._restaurant_repo = restaurant_repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._restaurant_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Restaurant partner profile not found")

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "restaurant_name": profile.restaurant_name,
            "description": profile.description,
            "cuisine_type": profile.cuisine_type,
            "address": profile.address,
            "phone": profile.phone,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }
