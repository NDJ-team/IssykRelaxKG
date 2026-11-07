from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.favorite import Favorite as FavoriteEntity
from app.domain.interfaces.repositories.favorite_repository import FavoriteRepository
from app.infrastructure.database.models.favorite import FavoriteModel


class SQLAlchemyFavoriteRepository(FavoriteRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, user_id: UUID, property_id: UUID) -> FavoriteEntity:
        existing = await self.is_favorited(user_id, property_id)
        if existing:
            raise ValueError("Already favorited")

        model = FavoriteModel(user_id=user_id, property_id=property_id)
        self._session.add(model)
        await self._session.flush()

        return FavoriteEntity(
            id=model.id,
            user_id=model.user_id,
            property_id=model.property_id,
            created_at=model.created_at,
        )

    async def remove(self, user_id: UUID, property_id: UUID) -> None:
        result = await self._session.execute(
            select(FavoriteModel).where(
                FavoriteModel.user_id == user_id,
                FavoriteModel.property_id == property_id,
            )
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    async def get_by_user(
        self, user_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[FavoriteEntity], int]:
        total_result = await self._session.execute(
            select(func.count()).select_from(FavoriteModel).where(FavoriteModel.user_id == user_id)
        )
        total = total_result.scalar() or 0

        result = await self._session.execute(
            select(FavoriteModel)
            .where(FavoriteModel.user_id == user_id)
            .order_by(FavoriteModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        models = result.scalars().all()

        entities = [
            FavoriteEntity(id=m.id, user_id=m.user_id, property_id=m.property_id, created_at=m.created_at)
            for m in models
        ]
        return entities, total

    async def is_favorited(self, user_id: UUID, property_id: UUID) -> bool:
        result = await self._session.execute(
            select(FavoriteModel).where(
                FavoriteModel.user_id == user_id,
                FavoriteModel.property_id == property_id,
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_favorited_property_ids(self, user_id: UUID) -> list[UUID]:
        result = await self._session.execute(
            select(FavoriteModel.property_id).where(FavoriteModel.user_id == user_id)
        )
        return [row[0] for row in result.all()]
