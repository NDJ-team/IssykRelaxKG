from __future__ import annotations

from uuid import UUID

from app.domain.interfaces.repositories.favorite_repository import FavoriteRepository
from app.domain.interfaces.repositories.property_repository import PropertyRepository


class RemoveFavoriteUseCase:
    def __init__(self, favorite_repo: FavoriteRepository, property_repo: PropertyRepository) -> None:
        self._favorite_repo = favorite_repo
        self._property_repo = property_repo

    async def execute(self, user_id: UUID, property_id: UUID) -> None:
        await self._favorite_repo.remove(user_id, property_id)
        await self._property_repo.add_rating_points(property_id, -2)
