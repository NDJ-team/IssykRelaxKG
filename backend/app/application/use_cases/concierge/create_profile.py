from __future__ import annotations

from datetime import datetime
from uuid import UUID

from app.domain.entities.concierge_profile import ConciergeProfile as ConciergeProfileEntity
from app.domain.interfaces.repositories.concierge_repository import ConciergeRepository


class CreateConciergeProfileUseCase:
    def __init__(self, concierge_repo: ConciergeRepository) -> None:
        self._concierge_repo = concierge_repo

    async def execute(self, user_id: UUID, bio: str | None = None, service_areas: str | None = None) -> dict:
        existing = await self._concierge_repo.get_profile_by_user_id(user_id)
        if existing:
            raise ValueError("Concierge profile already exists")

        profile = ConciergeProfileEntity.create(user_id=user_id, bio=bio, service_areas=service_areas)
        await self._concierge_repo.create_profile(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "bio": profile.bio,
            "service_areas": profile.service_areas,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
        }


class UpdateConciergeProfileUseCase:
    def __init__(self, concierge_repo: ConciergeRepository) -> None:
        self._concierge_repo = concierge_repo

    async def execute(self, user_id: UUID, bio: str | None = None, service_areas: str | None = None) -> dict:
        profile = await self._concierge_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Concierge profile not found. Create one first.")

        profile.bio = bio if bio is not None else profile.bio
        profile.service_areas = service_areas if service_areas is not None else profile.service_areas
        profile.updated_at = datetime.now()

        await self._concierge_repo.update_profile(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "bio": profile.bio,
            "service_areas": profile.service_areas,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }


class GetConciergeProfileUseCase:
    def __init__(self, concierge_repo: ConciergeRepository) -> None:
        self._concierge_repo = concierge_repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._concierge_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Concierge profile not found")

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "bio": profile.bio,
            "service_areas": profile.service_areas,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }
