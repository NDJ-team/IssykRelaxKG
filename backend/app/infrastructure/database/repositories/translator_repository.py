from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.translator_profile import TranslatorProfile as TranslatorProfileEntity
from app.domain.interfaces.repositories.translator_repository import TranslatorRepository
from app.infrastructure.database.models.translator_profile import TranslatorProfileModel


class SQLAlchemyTranslatorRepository(TranslatorRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_profile(self, profile: TranslatorProfileEntity) -> TranslatorProfileEntity:
        model = TranslatorProfileModel(
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

    async def get_profile_by_user_id(self, user_id: UUID) -> TranslatorProfileEntity | None:
        result = await self._session.execute(select(TranslatorProfileModel).where(TranslatorProfileModel.user_id == user_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_profile_by_id(self, profile_id: UUID) -> TranslatorProfileEntity | None:
        result = await self._session.execute(select(TranslatorProfileModel).where(TranslatorProfileModel.id == profile_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update_profile(self, profile: TranslatorProfileEntity) -> TranslatorProfileEntity:
        result = await self._session.execute(select(TranslatorProfileModel).where(TranslatorProfileModel.id == profile.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Translator profile not found")
        model.bio = profile.bio
        model.languages = profile.languages
        model.is_approved = profile.is_approved
        model.updated_at = profile.updated_at
        await self._session.flush()
        return profile

    async def list_profiles(self, offset: int = 0, limit: int = 20) -> tuple[list[TranslatorProfileEntity], int]:
        base = select(TranslatorProfileModel).where(TranslatorProfileModel.is_approved == True)
        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(base.order_by(TranslatorProfileModel.created_at.desc()).offset(offset).limit(limit))
        return [self._to_entity(m) for m in result.scalars().all()], total

    def _to_entity(self, model: TranslatorProfileModel) -> TranslatorProfileEntity:
        return TranslatorProfileEntity(
            id=model.id,
            user_id=model.user_id,
            bio=model.bio,
            languages=model.languages,
            is_approved=model.is_approved,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
