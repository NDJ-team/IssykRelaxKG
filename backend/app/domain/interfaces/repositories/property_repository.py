from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.property import Property


class PropertyRepository(ABC):
    @abstractmethod
    async def create(self, property: Property) -> Property: ...

    @abstractmethod
    async def get_by_id(self, property_id: UUID) -> Property | None: ...

    @abstractmethod
    async def get_by_owner(self, owner_id: UUID, offset: int = 0, limit: int = 20) -> list[Property]: ...

    @abstractmethod
    async def search(
        self,
        query: str | None = None,
        category_id: UUID | None = None,
        city_id: UUID | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        max_guests: int | None = None,
        amenity_slugs: list[str] | None = None,
        sort_by: str = "rating_points",
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[Property], int]: ...

    @abstractmethod
    async def update(self, property: Property) -> Property: ...

    @abstractmethod
    async def delete(self, property_id: UUID) -> None: ...

    @abstractmethod
    async def add_rating_points(self, property_id: UUID, delta: int) -> None: ...

    @abstractmethod
    async def get_by_ids(self, property_ids: list[UUID]) -> list[Property]: ...
