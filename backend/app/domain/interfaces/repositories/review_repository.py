from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.review import Review


class ReviewRepository(ABC):
    @abstractmethod
    async def create(self, review: Review) -> Review: ...

    @abstractmethod
    async def get_by_id(self, review_id: UUID) -> Review | None: ...

    @abstractmethod
    async def get_by_booking(self, booking_id: UUID) -> Review | None: ...

    @abstractmethod
    async def get_by_property(
        self, property_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[Review], int]: ...

    @abstractmethod
    async def update(self, review: Review) -> Review: ...

    @abstractmethod
    async def delete(self, review_id: UUID) -> None: ...
