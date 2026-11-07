from __future__ import annotations

from uuid import UUID

from app.domain.interfaces.repositories.property_repository import PropertyRepository


class AdminAdjustRatingUseCase:
    def __init__(self, property_repo: PropertyRepository) -> None:
        self._property_repo = property_repo

    async def execute(self, property_id: UUID, points: int) -> dict[str, int]:
        property = await self._property_repo.get_by_id(property_id)
        if not property:
            raise ValueError("Property not found")

        await self._property_repo.add_rating_points(property_id, points)
        updated = await self._property_repo.get_by_id(property_id)
        return {"rating_points": updated.rating_points if updated else 0}
