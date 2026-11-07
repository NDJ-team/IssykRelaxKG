from __future__ import annotations

from uuid import UUID

from app.application.dto.favorite_dto import FavoriteResponse
from app.domain.interfaces.repositories.favorite_repository import FavoriteRepository
from app.domain.interfaces.repositories.property_repository import PropertyRepository


class AddFavoriteUseCase:
    def __init__(self, favorite_repo: FavoriteRepository, property_repo: PropertyRepository) -> None:
        self._favorite_repo = favorite_repo
        self._property_repo = property_repo

    async def execute(self, user_id: UUID, property_id: UUID) -> FavoriteResponse:
        property = await self._property_repo.get_by_id(property_id)
        if not property:
            raise ValueError("Property not found")

        favorite = await self._favorite_repo.add(user_id, property_id)
        await self._property_repo.add_rating_points(property_id, 2)

        return FavoriteResponse(
            id=str(favorite.id),
            property_id=str(favorite.property_id),
            created_at=favorite.created_at.isoformat(),
        )
