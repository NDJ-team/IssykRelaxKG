from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities.local_experience import LocalExperience, LocalHostProfile
from app.domain.interfaces.repositories.local_experience_repository import LocalExperienceRepository
from app.infrastructure.database.models.local_experience import LocalExperienceModel
from app.infrastructure.database.models.local_host_profile import LocalHostProfileModel
from app.infrastructure.database.models.role import RoleModel
from app.infrastructure.database.models.user_role import UserRoleModel


class SQLAlchemyLocalExperienceRepository(LocalExperienceRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_profile(self, profile: LocalHostProfile) -> LocalHostProfile:
        model = LocalHostProfileModel(
            id=profile.id,
            user_id=profile.user_id,
            bio=profile.bio,
            experience_years=profile.experience_years,
            languages=profile.languages,
            is_approved=profile.is_approved,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        await self._ensure_host_role(profile.user_id)
        return profile

    async def get_profile_by_user_id(self, user_id: UUID) -> LocalHostProfile | None:
        result = await self._session.execute(
            select(LocalHostProfileModel).where(LocalHostProfileModel.user_id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._profile_to_entity(model) if model else None

    async def get_profile_by_id(self, profile_id: UUID) -> LocalHostProfile | None:
        result = await self._session.execute(
            select(LocalHostProfileModel).where(LocalHostProfileModel.id == profile_id)
        )
        model = result.scalar_one_or_none()
        return self._profile_to_entity(model) if model else None

    async def create_experience(self, experience: LocalExperience) -> LocalExperience:
        model = LocalExperienceModel(
            id=experience.id,
            host_id=experience.host_id,
            title=experience.title,
            description=experience.description,
            category=experience.category,
            price=float(experience.price),
            currency=experience.currency,
            duration_minutes=experience.duration_minutes,
            max_guests=experience.max_guests,
            city_id=experience.city_id,
            address=experience.address,
            latitude=float(experience.latitude) if experience.latitude is not None else None,
            longitude=float(experience.longitude) if experience.longitude is not None else None,
            images=experience.images or [],
            includes=experience.includes,
            languages=experience.languages,
            status=experience.status,
            is_active=experience.is_active,
            created_at=experience.created_at,
            updated_at=experience.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_experience_by_id(experience.id)
        return created or experience

    async def get_experience_by_id(self, experience_id: UUID) -> LocalExperience | None:
        result = await self._session.execute(
            select(LocalExperienceModel)
            .options(selectinload(LocalExperienceModel.city))
            .where(LocalExperienceModel.id == experience_id)
        )
        model = result.scalar_one_or_none()
        return self._experience_to_entity(model) if model else None

    async def list_experiences(
        self,
        city_id: UUID | None = None,
        category: str | None = None,
        query: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[LocalExperience], int]:
        base = select(LocalExperienceModel).where(
            LocalExperienceModel.is_active == True,  # noqa: E712
            LocalExperienceModel.status == "approved",
        )
        if city_id:
            base = base.where(LocalExperienceModel.city_id == city_id)
        if category:
            base = base.where(LocalExperienceModel.category == category)
        if query:
            pattern = f"%{query.strip()}%"
            base = base.where(
                or_(
                    LocalExperienceModel.title.ilike(pattern),
                    LocalExperienceModel.description.ilike(pattern),
                )
            )

        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(
            base.options(selectinload(LocalExperienceModel.city))
            .order_by(LocalExperienceModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return [self._experience_to_entity(model) for model in result.scalars().all()], total

    async def list_by_host(
        self,
        host_id: UUID,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[LocalExperience], int]:
        base = select(LocalExperienceModel).where(LocalExperienceModel.host_id == host_id)
        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(
            base.options(selectinload(LocalExperienceModel.city))
            .order_by(LocalExperienceModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return [self._experience_to_entity(model) for model in result.scalars().all()], total

    async def update_experience(self, experience: LocalExperience) -> LocalExperience:
        result = await self._session.execute(
            select(LocalExperienceModel).where(LocalExperienceModel.id == experience.id)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Experience not found")

        model.title = experience.title
        model.description = experience.description
        model.category = experience.category
        model.price = float(experience.price)
        model.currency = experience.currency
        model.duration_minutes = experience.duration_minutes
        model.max_guests = experience.max_guests
        model.city_id = experience.city_id
        model.address = experience.address
        model.latitude = float(experience.latitude) if experience.latitude is not None else None
        model.longitude = float(experience.longitude) if experience.longitude is not None else None
        model.images = experience.images or []
        model.includes = experience.includes
        model.languages = experience.languages
        model.status = experience.status
        model.is_active = experience.is_active
        model.updated_at = experience.updated_at
        await self._session.flush()
        updated = await self.get_experience_by_id(experience.id)
        return updated or experience

    async def _ensure_host_role(self, user_id: UUID) -> None:
        role_result = await self._session.execute(select(RoleModel).where(RoleModel.slug == "local_host"))
        role = role_result.scalar_one_or_none()
        if not role:
            return
        link_result = await self._session.execute(
            select(UserRoleModel).where(
                UserRoleModel.user_id == user_id,
                UserRoleModel.role_id == role.id,
            )
        )
        if link_result.scalar_one_or_none():
            return
        self._session.add(UserRoleModel(user_id=user_id, role_id=role.id))
        await self._session.flush()

    def _profile_to_entity(self, model: LocalHostProfileModel) -> LocalHostProfile:
        return LocalHostProfile(
            id=model.id,
            user_id=model.user_id,
            bio=model.bio,
            experience_years=model.experience_years,
            languages=model.languages,
            is_approved=model.is_approved,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _experience_to_entity(self, model: LocalExperienceModel) -> LocalExperience:
        city = model.__dict__.get("city")
        return LocalExperience(
            id=model.id,
            host_id=model.host_id,
            title=model.title,
            description=model.description,
            category=model.category,
            price=Decimal(str(model.price)),
            currency=model.currency,
            duration_minutes=model.duration_minutes,
            max_guests=model.max_guests,
            city_id=model.city_id,
            address=model.address,
            latitude=Decimal(str(model.latitude)) if model.latitude is not None else None,
            longitude=Decimal(str(model.longitude)) if model.longitude is not None else None,
            images=list(model.images or []),
            includes=model.includes,
            languages=model.languages,
            status=model.status,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
            city_name=city.name if city else None,
            city_slug=city.slug if city else None,
        )
