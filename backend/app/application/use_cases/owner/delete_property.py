from __future__ import annotations

from uuid import UUID

from app.domain.interfaces.repositories.property_repository import PropertyRepository


class DeletePropertyUseCase:
    def __init__(self, property_repo: PropertyRepository) -> None:
        self._property_repo = property_repo

    async def execute(self, property_id: UUID, owner_id: UUID) -> None:
        property = await self._property_repo.get_by_id(property_id)
        if not property:
            raise ValueError("Property not found")
        if property.owner_id != owner_id:
            raise PermissionError("You can only delete your own properties")

        await self._property_repo.delete(property_id)
