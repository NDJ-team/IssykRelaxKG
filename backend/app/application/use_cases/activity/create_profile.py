from __future__ import annotations

from datetime import datetime
from uuid import UUID

from app.domain.entities.activity_provider_profile import ActivityProviderProfile as ActivityProviderProfileEntity
from app.domain.interfaces.repositories.activity_repository import ActivityRepository


class CreateActivityProviderProfileUseCase:
    def __init__(self, activity_repo: ActivityRepository) -> None:
        self._activity_repo = activity_repo

    async def execute(self, user_id: UUID, company_name: str | None = None, bio: str | None = None) -> dict:
        existing = await self._activity_repo.get_profile_by_user_id(user_id)
        if existing:
            raise ValueError("Activity provider profile already exists")

        profile = ActivityProviderProfileEntity.create(user_id=user_id, company_name=company_name, bio=bio)
        await self._activity_repo.create_profile(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "company_name": profile.company_name,
            "bio": profile.bio,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
        }


class UpdateActivityProviderProfileUseCase:
    def __init__(self, activity_repo: ActivityRepository) -> None:
        self._activity_repo = activity_repo

    async def execute(self, user_id: UUID, company_name: str | None = None, bio: str | None = None) -> dict:
        profile = await self._activity_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Activity provider profile not found. Create one first.")

        profile.company_name = company_name if company_name is not None else profile.company_name
        profile.bio = bio if bio is not None else profile.bio
        profile.updated_at = datetime.now()

        await self._activity_repo.update_profile(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "company_name": profile.company_name,
            "bio": profile.bio,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }


class GetActivityProviderProfileUseCase:
    def __init__(self, activity_repo: ActivityRepository) -> None:
        self._activity_repo = activity_repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._activity_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Activity provider profile not found")

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "company_name": profile.company_name,
            "bio": profile.bio,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }
