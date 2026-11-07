from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.domain.entities.tour import Tour as TourEntity
from app.domain.interfaces.repositories.guide_repository import GuideRepository


class CreateTourUseCase:
    def __init__(self, guide_repo: GuideRepository) -> None:
        self._guide_repo = guide_repo

    async def execute(
        self,
        user_id: UUID,
        title: str,
        price: float,
        duration_days: int,
        max_guests: int = 10,
        currency: str = "KGS",
        description: str | None = None,
        includes: str | None = None,
        meeting_point: str | None = None,
        city_id: str | None = None,
    ) -> dict:
        profile = await self._guide_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Guide profile not found. Create one first.")

        tour = TourEntity.create(
            guide_id=profile.id,
            title=title,
            price=Decimal(str(price)),
            duration_days=duration_days,
            max_guests=max_guests,
            currency=currency,
            description=description,
            includes=includes,
            meeting_point=meeting_point,
            city_id=UUID(city_id) if city_id else None,
        )
        await self._guide_repo.create_tour(tour)

        return _tour_to_dict(tour)


class UpdateTourUseCase:
    def __init__(self, guide_repo: GuideRepository) -> None:
        self._guide_repo = guide_repo

    async def execute(
        self,
        tour_id: UUID,
        user_id: UUID,
        title: str | None = None,
        price: float | None = None,
        duration_days: int | None = None,
        max_guests: int | None = None,
        currency: str | None = None,
        description: str | None = None,
        includes: str | None = None,
        meeting_point: str | None = None,
        is_active: bool | None = None,
        city_id: str | None = None,
    ) -> dict:
        profile = await self._guide_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Guide profile not found")

        tour = await self._guide_repo.get_tour_by_id(tour_id)
        if not tour:
            raise ValueError("Tour not found")
        if tour.guide_id != profile.id:
            raise PermissionError("This tour does not belong to you")

        if title is not None:
            tour.title = title
        if price is not None:
            tour.price = Decimal(str(price))
        if duration_days is not None:
            tour.duration_days = duration_days
        if max_guests is not None:
            tour.max_guests = max_guests
        if currency is not None:
            tour.currency = currency
        if description is not None:
            tour.description = description
        if includes is not None:
            tour.includes = includes
        if meeting_point is not None:
            tour.meeting_point = meeting_point
        if is_active is not None:
            tour.is_active = is_active
        if city_id is not None:
            tour.city_id = UUID(city_id)

        tour.updated_at = datetime.now()
        await self._guide_repo.update_tour(tour)

        return _tour_to_dict(tour)


class ListMyToursUseCase:
    def __init__(self, guide_repo: GuideRepository) -> None:
        self._guide_repo = guide_repo

    async def execute(self, user_id: UUID, offset: int = 0, limit: int = 20) -> dict:
        profile = await self._guide_repo.get_profile_by_user_id(user_id)
        if not profile:
            return {"items": [], "total": 0}

        items, total = await self._guide_repo.get_tours_by_guide(profile.id, offset=offset, limit=limit)
        return {"items": [_tour_to_dict(t) for t in items], "total": total}


class ListToursUseCase:
    def __init__(self, guide_repo: GuideRepository) -> None:
        self._guide_repo = guide_repo

    async def execute(self, city_id: str | None = None, offset: int = 0, limit: int = 20) -> dict:
        city_uuid = UUID(city_id) if city_id else None
        items, total = await self._guide_repo.list_tours(city_id=city_uuid, offset=offset, limit=limit)
        return {"items": [_tour_to_dict(t) for t in items], "total": total}


class GetTourUseCase:
    def __init__(self, guide_repo: GuideRepository) -> None:
        self._guide_repo = guide_repo

    async def execute(self, tour_id: UUID) -> dict:
        tour = await self._guide_repo.get_tour_by_id(tour_id)
        if not tour:
            raise ValueError("Tour not found")
        return _tour_to_dict(tour)


class DeleteTourUseCase:
    def __init__(self, guide_repo: GuideRepository) -> None:
        self._guide_repo = guide_repo

    async def execute(self, tour_id: UUID, user_id: UUID) -> None:
        profile = await self._guide_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Guide profile not found")

        tour = await self._guide_repo.get_tour_by_id(tour_id)
        if not tour:
            raise ValueError("Tour not found")
        if tour.guide_id != profile.id:
            raise PermissionError("This tour does not belong to you")

        await self._guide_repo.delete_tour(tour_id)


class GetGuideDashboardUseCase:
    def __init__(self, guide_repo: GuideRepository) -> None:
        self._guide_repo = guide_repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._guide_repo.get_profile_by_user_id(user_id)
        if not profile:
            return {"profile": None, "tours_count": 0, "active_tours": 0}

        items, _ = await self._guide_repo.get_tours_by_guide(profile.id, limit=1000)
        tours = [_tour_to_dict(t) for t in items]
        active = [t for t in tours if t["is_active"]]

        return {
            "profile": {
                "id": str(profile.id),
                "bio": profile.bio,
                "languages": profile.languages,
                "is_approved": profile.is_approved,
            },
            "tours_count": len(tours),
            "active_tours": len(active),
            "tours": tours,
        }

def _tour_to_dict(t: TourEntity) -> dict:
    return {
        "id": str(t.id),
        "guide_id": str(t.guide_id),
        "title": t.title,
        "description": t.description,
        "price": float(t.price),
        "currency": t.currency,
        "duration_days": t.duration_days,
        "max_guests": t.max_guests,
        "includes": t.includes,
        "meeting_point": t.meeting_point,
        "status": t.status,
        "is_active": t.is_active,
        "city_id": str(t.city_id) if t.city_id else None,
        "created_at": t.created_at.isoformat(),
        "updated_at": t.updated_at.isoformat(),
    }
