from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.domain.entities.local_experience import LocalExperience as LocalExperienceEntity
from app.domain.entities.local_experience import LocalHostProfile as LocalHostProfileEntity
from app.domain.interfaces.repositories.local_experience_repository import LocalExperienceRepository


class CreateLocalHostProfileUseCase:
    def __init__(self, repo: LocalExperienceRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        user_id: UUID,
        bio: str | None = None,
        experience_years: int | None = None,
        languages: str | None = None,
    ) -> dict:
        profile = await self._repo.get_profile_by_user_id(user_id)
        if profile:
            return _profile_to_dict(profile)

        profile = LocalHostProfileEntity.create(
            user_id=user_id,
            bio=bio,
            experience_years=experience_years,
            languages=languages,
        )
        await self._repo.create_profile(profile)
        return _profile_to_dict(profile)


class GetLocalHostProfileUseCase:
    def __init__(self, repo: LocalExperienceRepository) -> None:
        self._repo = repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Local host profile not found")
        return _profile_to_dict(profile)


class CreateLocalExperienceUseCase:
    def __init__(self, repo: LocalExperienceRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        user_id: UUID,
        title: str,
        category: str,
        price: float,
        description: str | None = None,
        currency: str = "KGS",
        duration_minutes: int | None = None,
        max_guests: int = 6,
        city_id: str | None = None,
        address: str | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
        images: list[str] | None = None,
        includes: str | None = None,
        languages: str | None = None,
    ) -> dict:
        if not title or not title.strip():
            raise ValueError("Experience title is required")
        if price is None or price <= 0:
            raise ValueError("Experience price must be positive")
        if max_guests < 1:
            raise ValueError("Experience must accept at least one guest")
        if duration_minutes is not None and duration_minutes < 1:
            raise ValueError("Experience duration must be positive")

        profile = await self._repo.get_profile_by_user_id(user_id)
        if not profile:
            profile = LocalHostProfileEntity.create(user_id=user_id)
            await self._repo.create_profile(profile)

        experience = LocalExperienceEntity.create(
            host_id=profile.id,
            title=title,
            category=category,
            price=Decimal(str(price)),
            description=description,
            currency=currency,
            duration_minutes=duration_minutes,
            max_guests=max_guests,
            city_id=UUID(city_id) if city_id else None,
            address=address,
            latitude=Decimal(str(latitude)) if latitude is not None else None,
            longitude=Decimal(str(longitude)) if longitude is not None else None,
            images=images or [],
            includes=includes,
            languages=languages,
        )
        await self._repo.create_experience(experience)
        return _experience_to_dict(experience)


class UpdateLocalExperienceUseCase:
    def __init__(self, repo: LocalExperienceRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        experience_id: UUID,
        user_id: UUID,
        title: str | None = None,
        category: str | None = None,
        price: float | None = None,
        description: str | None = None,
        duration_minutes: int | None = None,
        max_guests: int | None = None,
        city_id: str | None = None,
        address: str | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
        images: list[str] | None = None,
        includes: str | None = None,
        languages: str | None = None,
        is_active: bool | None = None,
    ) -> dict:
        profile = await self._repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Local host profile not found")

        experience = await self._repo.get_experience_by_id(experience_id)
        if not experience:
            raise ValueError("Experience not found")
        if experience.host_id != profile.id:
            raise PermissionError("This experience does not belong to you")

        if title is not None:
            experience.title = title
        if category is not None:
            experience.category = category
        if price is not None:
            experience.price = Decimal(str(price))
        if description is not None:
            experience.description = description
        if duration_minutes is not None:
            experience.duration_minutes = duration_minutes
        if max_guests is not None:
            experience.max_guests = max_guests
        if city_id is not None:
            experience.city_id = UUID(city_id) if city_id else None
        if address is not None:
            experience.address = address
        if latitude is not None:
            experience.latitude = Decimal(str(latitude))
        if longitude is not None:
            experience.longitude = Decimal(str(longitude))
        if images is not None:
            experience.images = images
        if includes is not None:
            experience.includes = includes
        if languages is not None:
            experience.languages = languages
        if is_active is not None:
            experience.is_active = is_active

        experience.updated_at = datetime.now()
        updated = await self._repo.update_experience(experience)
        return _experience_to_dict(updated)


class ListMyExperiencesUseCase:
    def __init__(self, repo: LocalExperienceRepository) -> None:
        self._repo = repo

    async def execute(self, user_id: UUID, offset: int = 0, limit: int = 20) -> dict:
        profile = await self._repo.get_profile_by_user_id(user_id)
        if not profile:
            return {"items": [], "total": 0}
        items, total = await self._repo.list_by_host(profile.id, offset=offset, limit=limit)
        return {"items": [_experience_to_dict(item) for item in items], "total": total}


class ListLocalExperiencesUseCase:
    def __init__(self, repo: LocalExperienceRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        city_id: str | None = None,
        category: str | None = None,
        query: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> dict:
        items, total = await self._repo.list_experiences(
            city_id=UUID(city_id) if city_id else None,
            category=category,
            query=query,
            offset=offset,
            limit=limit,
        )
        return {"items": [_experience_to_dict(item) for item in items], "total": total}


class GetLocalExperienceUseCase:
    def __init__(self, repo: LocalExperienceRepository) -> None:
        self._repo = repo

    async def execute(self, experience_id: UUID) -> dict:
        experience = await self._repo.get_experience_by_id(experience_id)
        if not experience or not experience.is_active or experience.status != "approved":
            raise ValueError("Experience not found")
        return _experience_to_dict(experience)


class GetLocalHostDashboardUseCase:
    def __init__(self, repo: LocalExperienceRepository) -> None:
        self._repo = repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._repo.get_profile_by_user_id(user_id)
        if not profile:
            return {"profile": None, "experiences_count": 0, "active_experiences": 0, "experiences": []}

        items, _ = await self._repo.list_by_host(profile.id, limit=1000)
        experiences = [_experience_to_dict(item) for item in items]
        active = [item for item in experiences if item["is_active"] and item["status"] == "approved"]

        return {
            "profile": _profile_to_dict(profile),
            "experiences_count": len(experiences),
            "active_experiences": len(active),
            "experiences": experiences,
        }


def _profile_to_dict(profile: LocalHostProfileEntity) -> dict:
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "bio": profile.bio,
        "experience_years": profile.experience_years,
        "languages": profile.languages,
        "is_approved": profile.is_approved,
        "created_at": profile.created_at.isoformat(),
        "updated_at": profile.updated_at.isoformat(),
    }


def _experience_to_dict(experience: LocalExperienceEntity) -> dict:
    return {
        "id": str(experience.id),
        "host_id": str(experience.host_id),
        "title": experience.title,
        "description": experience.description,
        "category": experience.category,
        "price": float(experience.price),
        "currency": experience.currency,
        "duration_minutes": experience.duration_minutes,
        "max_guests": experience.max_guests,
        "city_id": str(experience.city_id) if experience.city_id else None,
        "city": (
            {
                "id": str(experience.city_id),
                "name": experience.city_name,
                "slug": experience.city_slug,
            }
            if experience.city_id and experience.city_name
            else None
        ),
        "address": experience.address,
        "latitude": float(experience.latitude) if experience.latitude is not None else None,
        "longitude": float(experience.longitude) if experience.longitude is not None else None,
        "images": experience.images or [],
        "includes": experience.includes,
        "languages": experience.languages,
        "status": experience.status,
        "is_active": experience.is_active,
        "created_at": experience.created_at.isoformat(),
        "updated_at": experience.updated_at.isoformat(),
    }
