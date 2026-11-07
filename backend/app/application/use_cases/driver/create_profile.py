from __future__ import annotations

from datetime import datetime
from uuid import UUID

from app.domain.entities.driver_profile import DriverProfile as DriverProfileEntity
from app.domain.interfaces.repositories.driver_repository import DriverRepository


class CreateDriverProfileUseCase:
    def __init__(self, driver_repo: DriverRepository) -> None:
        self._driver_repo = driver_repo

    async def execute(self, user_id: UUID, bio: str | None = None, license_number: str | None = None, vehicle_info: str | None = None) -> dict:
        existing = await self._driver_repo.get_profile_by_user_id(user_id)
        if existing:
            raise ValueError("Driver profile already exists")

        profile = DriverProfileEntity.create(user_id=user_id, bio=bio, license_number=license_number, vehicle_info=vehicle_info)
        await self._driver_repo.create_profile(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "bio": profile.bio,
            "license_number": profile.license_number,
            "vehicle_info": profile.vehicle_info,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
        }


class UpdateDriverProfileUseCase:
    def __init__(self, driver_repo: DriverRepository) -> None:
        self._driver_repo = driver_repo

    async def execute(self, user_id: UUID, bio: str | None = None, license_number: str | None = None, vehicle_info: str | None = None) -> dict:
        profile = await self._driver_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Driver profile not found. Create one first.")

        profile.bio = bio if bio is not None else profile.bio
        profile.license_number = license_number if license_number is not None else profile.license_number
        profile.vehicle_info = vehicle_info if vehicle_info is not None else profile.vehicle_info
        profile.updated_at = datetime.now()

        await self._driver_repo.update_profile(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "bio": profile.bio,
            "license_number": profile.license_number,
            "vehicle_info": profile.vehicle_info,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }


class GetDriverProfileUseCase:
    def __init__(self, driver_repo: DriverRepository) -> None:
        self._driver_repo = driver_repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._driver_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Driver profile not found")

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "bio": profile.bio,
            "license_number": profile.license_number,
            "vehicle_info": profile.vehicle_info,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }
