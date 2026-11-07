from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.guide_profile import GuideProfile as GuideProfileEntity
from app.domain.entities.tour import Tour as TourEntity
from app.domain.interfaces.repositories.guide_repository import GuideRepository
from app.infrastructure.database.models.guide_profile import GuideProfileModel
from app.infrastructure.database.models.tour import TourModel


class SQLAlchemyGuideRepository(GuideRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_profile(self, profile: GuideProfileEntity) -> GuideProfileEntity:
        model = GuideProfileModel(
            id=profile.id,
            user_id=profile.user_id,
            bio=profile.bio,
            languages=profile.languages,
            is_approved=profile.is_approved,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return profile

    async def get_profile_by_user_id(self, user_id: UUID) -> GuideProfileEntity | None:
        result = await self._session.execute(select(GuideProfileModel).where(GuideProfileModel.user_id == user_id))
        model = result.scalar_one_or_none()
        return self._profile_to_entity(model) if model else None

    async def get_profile_by_id(self, profile_id: UUID) -> GuideProfileEntity | None:
        result = await self._session.execute(select(GuideProfileModel).where(GuideProfileModel.id == profile_id))
        model = result.scalar_one_or_none()
        return self._profile_to_entity(model) if model else None

    async def update_profile(self, profile: GuideProfileEntity) -> GuideProfileEntity:
        result = await self._session.execute(select(GuideProfileModel).where(GuideProfileModel.id == profile.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Guide profile not found")
        model.bio = profile.bio
        model.languages = profile.languages
        model.is_approved = profile.is_approved
        model.updated_at = profile.updated_at
        await self._session.flush()
        return profile

    async def create_tour(self, tour: TourEntity) -> TourEntity:
        model = TourModel(
            id=tour.id,
            guide_id=tour.guide_id,
            title=tour.title,
            description=tour.description,
            price=float(tour.price),
            currency=tour.currency,
            duration_days=tour.duration_days,
            max_guests=tour.max_guests,
            includes=tour.includes,
            meeting_point=tour.meeting_point,
            city_id=tour.city_id,
            status=tour.status,
            is_active=tour.is_active,
            created_at=tour.created_at,
            updated_at=tour.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return tour

    async def get_tour_by_id(self, tour_id: UUID) -> TourEntity | None:
        result = await self._session.execute(select(TourModel).where(TourModel.id == tour_id))
        model = result.scalar_one_or_none()
        return self._tour_to_entity(model) if model else None

    async def get_tours_by_guide(self, guide_profile_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[TourEntity], int]:
        base = select(TourModel).where(TourModel.guide_id == guide_profile_id)
        return await self._paginate_tours(base, offset, limit)

    async def list_tours(self, city_id: UUID | None = None, offset: int = 0, limit: int = 20) -> tuple[list[TourEntity], int]:
        base = select(TourModel).where(TourModel.is_active == True, TourModel.status == "approved")
        if city_id:
            base = base.where(TourModel.city_id == city_id)
        return await self._paginate_tours(base, offset, limit)

    async def update_tour(self, tour: TourEntity) -> TourEntity:
        result = await self._session.execute(select(TourModel).where(TourModel.id == tour.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Tour not found")
        model.title = tour.title
        model.description = tour.description
        model.price = float(tour.price)
        model.currency = tour.currency
        model.duration_days = tour.duration_days
        model.max_guests = tour.max_guests
        model.includes = tour.includes
        model.meeting_point = tour.meeting_point
        model.city_id = tour.city_id
        model.status = tour.status
        model.is_active = tour.is_active
        model.updated_at = tour.updated_at
        await self._session.flush()
        return tour

    async def delete_tour(self, tour_id: UUID) -> None:
        result = await self._session.execute(select(TourModel).where(TourModel.id == tour_id))
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    async def list_guides(self, offset: int = 0, limit: int = 20) -> tuple[list[GuideProfileEntity], int]:
        base = select(GuideProfileModel).where(GuideProfileModel.is_approved == True)
        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(base.order_by(GuideProfileModel.created_at.desc()).offset(offset).limit(limit))
        return [self._profile_to_entity(m) for m in result.scalars().all()], total

    async def _paginate_tours(self, base, offset: int, limit: int) -> tuple[list[TourEntity], int]:
        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(base.order_by(TourModel.created_at.desc()).offset(offset).limit(limit))
        return [self._tour_to_entity(m) for m in result.scalars().all()], total

    def _profile_to_entity(self, model: GuideProfileModel) -> GuideProfileEntity:
        return GuideProfileEntity(
            id=model.id,
            user_id=model.user_id,
            bio=model.bio,
            languages=model.languages,
            is_approved=model.is_approved,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _tour_to_entity(self, model: TourModel) -> TourEntity:
        return TourEntity(
            id=model.id,
            guide_id=model.guide_id,
            title=model.title,
            description=model.description,
            price=Decimal(str(model.price)),
            currency=model.currency,
            duration_days=model.duration_days,
            max_guests=model.max_guests,
            includes=model.includes,
            meeting_point=model.meeting_point,
            city_id=model.city_id,
            status=model.status,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
