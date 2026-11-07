from __future__ import annotations

from typing import Any
from uuid import UUID

from app.domain.entities.property import PropertyStatus
from app.domain.interfaces.repositories.property_repository import PropertyRepository


class ApprovePropertyUseCase:
    def __init__(self, property_repo: PropertyRepository) -> None:
        self._property_repo = property_repo

    async def execute(self, property_id: UUID) -> dict[str, Any]:
        property = await self._property_repo.get_by_id(property_id)
        if not property:
            raise ValueError("Property not found")

        property.status = PropertyStatus.PUBLISHED
        await self._property_repo.update(property)

        return {"id": str(property_id), "status": PropertyStatus.PUBLISHED}
