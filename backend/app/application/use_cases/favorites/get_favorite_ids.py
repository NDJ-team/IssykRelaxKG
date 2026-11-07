from __future__ import annotations

from uuid import UUID

from app.application.dto.favorite_dto import PropertyFavoriteIdsResponse
from app.domain.interfaces.repositories.favorite_repository import FavoriteRepository


class GetFavoriteIdsUseCase:
    def __init__(self, favorite_repo: FavoriteRepository) -> None:
        self._favorite_repo = favorite_repo

    async def execute(self, user_id: UUID) -> PropertyFavoriteIdsResponse:
        ids = await self._favorite_repo.get_favorited_property_ids(user_id)
        return PropertyFavoriteIdsResponse(favorite_ids=[str(i) for i in ids])
