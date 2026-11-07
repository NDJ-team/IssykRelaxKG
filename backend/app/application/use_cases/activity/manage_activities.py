from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.domain.entities.activity import Activity as ActivityEntity
from app.domain.interfaces.repositories.activity_repository import ActivityRepository


class CreateActivityUseCase:
    def __init__(self, activity_repo: ActivityRepository) -> None:
        self._activity_repo = activity_repo

    async def execute(
        self,
        user_id: UUID,
        title: str,
        price: float,
        max_participants: int = 10,
        currency: str = "KGS",
        description: str | None = None,
        duration_minutes: int | None = None,
        location: str = "",
        city_id: str | None = None,
    ) -> dict:
        profile = await self._activity_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Activity provider profile not found. Create one first.")

        activity = ActivityEntity.create(
            provider_id=profile.id,
            title=title,
            price=Decimal(str(price)),
            max_participants=max_participants,
            currency=currency,
            description=description,
            duration_minutes=duration_minutes,
            location=location,
            city_id=UUID(city_id) if city_id else None,
        )
        await self._activity_repo.create_activity(activity)

        return _activity_to_dict(activity)


class UpdateActivityUseCase:
    def __init__(self, activity_repo: ActivityRepository) -> None:
        self._activity_repo = activity_repo

    async def execute(
        self,
        activity_id: UUID,
        user_id: UUID,
        title: str | None = None,
        price: float | None = None,
        max_participants: int | None = None,
        currency: str | None = None,
        description: str | None = None,
        duration_minutes: int | None = None,
        location: str | None = None,
        is_active: bool | None = None,
        city_id: str | None = None,
    ) -> dict:
        profile = await self._activity_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Activity provider profile not found")

        activity = await self._activity_repo.get_activity_by_id(activity_id)
        if not activity:
            raise ValueError("Activity not found")
        if activity.provider_id != profile.id:
            raise PermissionError("This activity does not belong to you")

        if title is not None:
            activity.title = title
        if price is not None:
            activity.price = Decimal(str(price))
        if max_participants is not None:
            activity.max_participants = max_participants
        if currency is not None:
            activity.currency = currency
        if description is not None:
            activity.description = description
        if duration_minutes is not None:
            activity.duration_minutes = duration_minutes
        if location is not None:
            activity.location = location
        if is_active is not None:
            activity.is_active = is_active
        if city_id is not None:
            activity.city_id = UUID(city_id)

        activity.updated_at = datetime.now()
        await self._activity_repo.update_activity(activity)

        return _activity_to_dict(activity)


class ListMyActivitiesUseCase:
    def __init__(self, activity_repo: ActivityRepository) -> None:
        self._activity_repo = activity_repo

    async def execute(self, user_id: UUID, offset: int = 0, limit: int = 20) -> dict:
        profile = await self._activity_repo.get_profile_by_user_id(user_id)
        if not profile:
            return {"items": [], "total": 0}

        items, total = await self._activity_repo.get_activities_by_provider(profile.id, offset=offset, limit=limit)
        return {"items": [_activity_to_dict(t) for t in items], "total": total}


class ListActivitiesUseCase:
    def __init__(self, activity_repo: ActivityRepository) -> None:
        self._activity_repo = activity_repo

    async def execute(self, city_id: str | None = None, offset: int = 0, limit: int = 20) -> dict:
        city_uuid = UUID(city_id) if city_id else None
        items, total = await self._activity_repo.list_activities(city_id=city_uuid, offset=offset, limit=limit)
        return {"items": [_activity_to_dict(t) for t in items], "total": total}


class GetActivityUseCase:
    def __init__(self, activity_repo: ActivityRepository) -> None:
        self._activity_repo = activity_repo

    async def execute(self, activity_id: UUID) -> dict:
        activity = await self._activity_repo.get_activity_by_id(activity_id)
        if not activity:
            raise ValueError("Activity not found")
        return _activity_to_dict(activity)


class DeleteActivityUseCase:
    def __init__(self, activity_repo: ActivityRepository) -> None:
        self._activity_repo = activity_repo

    async def execute(self, activity_id: UUID, user_id: UUID) -> None:
        profile = await self._activity_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Activity provider profile not found")

        activity = await self._activity_repo.get_activity_by_id(activity_id)
        if not activity:
            raise ValueError("Activity not found")
        if activity.provider_id != profile.id:
            raise PermissionError("This activity does not belong to you")

        await self._activity_repo.delete_activity(activity_id)


class GetActivityDashboardUseCase:
    def __init__(self, activity_repo: ActivityRepository) -> None:
        self._activity_repo = activity_repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._activity_repo.get_profile_by_user_id(user_id)
        if not profile:
            return {"profile": None, "activities_count": 0, "active_activities": 0}

        items, _ = await self._activity_repo.get_activities_by_provider(profile.id, limit=1000)
        activities = [_activity_to_dict(t) for t in items]
        active = [t for t in activities if t["is_active"]]

        return {
            "profile": {
                "id": str(profile.id),
                "company_name": profile.company_name,
                "bio": profile.bio,
                "is_approved": profile.is_approved,
            },
            "activities_count": len(activities),
            "active_activities": len(active),
            "activities": activities,
        }


def _activity_to_dict(a: ActivityEntity) -> dict:
    return {
        "id": str(a.id),
        "provider_id": str(a.provider_id),
        "title": a.title,
        "description": a.description,
        "price": float(a.price),
        "currency": a.currency,
        "max_participants": a.max_participants,
        "duration_minutes": a.duration_minutes,
        "location": a.location,
        "status": a.status,
        "is_active": a.is_active,
        "city_id": str(a.city_id) if a.city_id else None,
        "created_at": a.created_at.isoformat(),
        "updated_at": a.updated_at.isoformat(),
    }
