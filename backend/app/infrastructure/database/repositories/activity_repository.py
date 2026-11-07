from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.activity import Activity as ActivityEntity
from app.domain.entities.activity_provider_profile import ActivityProviderProfile as ActivityProviderProfileEntity
from app.domain.interfaces.repositories.activity_repository import ActivityRepository
from app.infrastructure.database.models.activity import ActivityModel
from app.infrastructure.database.models.activity_provider_profile import ActivityProviderProfileModel


class SQLAlchemyActivityRepository(ActivityRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_profile(self, profile: ActivityProviderProfileEntity) -> ActivityProviderProfileEntity:
        model = ActivityProviderProfileModel(
            id=profile.id,
            user_id=profile.user_id,
            company_name=profile.company_name,
            bio=profile.bio,
            is_approved=profile.is_approved,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return profile

    async def get_profile_by_user_id(self, user_id: UUID) -> ActivityProviderProfileEntity | None:
        result = await self._session.execute(select(ActivityProviderProfileModel).where(ActivityProviderProfileModel.user_id == user_id))
        model = result.scalar_one_or_none()
        return self._profile_to_entity(model) if model else None

    async def get_profile_by_id(self, profile_id: UUID) -> ActivityProviderProfileEntity | None:
        result = await self._session.execute(select(ActivityProviderProfileModel).where(ActivityProviderProfileModel.id == profile_id))
        model = result.scalar_one_or_none()
        return self._profile_to_entity(model) if model else None

    async def update_profile(self, profile: ActivityProviderProfileEntity) -> ActivityProviderProfileEntity:
        result = await self._session.execute(select(ActivityProviderProfileModel).where(ActivityProviderProfileModel.id == profile.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Activity provider profile not found")
        model.company_name = profile.company_name
        model.bio = profile.bio
        model.is_approved = profile.is_approved
        model.updated_at = profile.updated_at
        await self._session.flush()
        return profile

    async def create_activity(self, activity: ActivityEntity) -> ActivityEntity:
        model = ActivityModel(
            id=activity.id,
            provider_id=activity.provider_id,
            title=activity.title,
            description=activity.description,
            price=float(activity.price),
            currency=activity.currency,
            max_participants=activity.max_participants,
            duration_minutes=activity.duration_minutes,
            location=activity.location,
            city_id=activity.city_id,
            status=activity.status,
            is_active=activity.is_active,
            created_at=activity.created_at,
            updated_at=activity.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return activity

    async def get_activity_by_id(self, activity_id: UUID) -> ActivityEntity | None:
        result = await self._session.execute(select(ActivityModel).where(ActivityModel.id == activity_id))
        model = result.scalar_one_or_none()
        return self._activity_to_entity(model) if model else None

    async def get_activities_by_provider(self, provider_profile_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[ActivityEntity], int]:
        base = select(ActivityModel).where(ActivityModel.provider_id == provider_profile_id)
        return await self._paginate_activities(base, offset, limit)

    async def list_activities(self, city_id: UUID | None = None, offset: int = 0, limit: int = 20) -> tuple[list[ActivityEntity], int]:
        base = select(ActivityModel).where(ActivityModel.is_active == True, ActivityModel.status == "approved")
        if city_id:
            base = base.where(ActivityModel.city_id == city_id)
        return await self._paginate_activities(base, offset, limit)

    async def update_activity(self, activity: ActivityEntity) -> ActivityEntity:
        result = await self._session.execute(select(ActivityModel).where(ActivityModel.id == activity.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Activity not found")
        model.title = activity.title
        model.description = activity.description
        model.price = float(activity.price)
        model.currency = activity.currency
        model.max_participants = activity.max_participants
        model.duration_minutes = activity.duration_minutes
        model.location = activity.location
        model.city_id = activity.city_id
        model.status = activity.status
        model.is_active = activity.is_active
        model.updated_at = activity.updated_at
        await self._session.flush()
        return activity

    async def delete_activity(self, activity_id: UUID) -> None:
        result = await self._session.execute(select(ActivityModel).where(ActivityModel.id == activity_id))
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    async def list_providers(self, offset: int = 0, limit: int = 20) -> tuple[list[ActivityProviderProfileEntity], int]:
        base = select(ActivityProviderProfileModel).where(ActivityProviderProfileModel.is_approved == True)
        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(base.order_by(ActivityProviderProfileModel.created_at.desc()).offset(offset).limit(limit))
        return [self._profile_to_entity(m) for m in result.scalars().all()], total

    async def _paginate_activities(self, base, offset: int, limit: int) -> tuple[list[ActivityEntity], int]:
        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(base.order_by(ActivityModel.created_at.desc()).offset(offset).limit(limit))
        return [self._activity_to_entity(m) for m in result.scalars().all()], total

    def _profile_to_entity(self, model: ActivityProviderProfileModel) -> ActivityProviderProfileEntity:
        return ActivityProviderProfileEntity(
            id=model.id,
            user_id=model.user_id,
            company_name=model.company_name,
            bio=model.bio,
            is_approved=model.is_approved,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _activity_to_entity(self, model: ActivityModel) -> ActivityEntity:
        return ActivityEntity(
            id=model.id,
            provider_id=model.provider_id,
            title=model.title,
            description=model.description,
            price=Decimal(str(model.price)),
            currency=model.currency,
            max_participants=model.max_participants,
            duration_minutes=model.duration_minutes,
            location=model.location,
            city_id=model.city_id,
            status=model.status,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
