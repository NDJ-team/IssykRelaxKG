from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.favorite import Favorite


class FavoriteRepository(ABC):
    @abstractmethod
    async def add(self, user_id: UUID, property_id: UUID) -> Favorite: ...

    @abstractmethod
    async def remove(self, user_id: UUID, property_id: UUID) -> None: ...

    @abstractmethod
    async def get_by_user(self, user_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[Favorite], int]: ...

    @abstractmethod
    async def is_favorited(self, user_id: UUID, property_id: UUID) -> bool: ...

    @abstractmethod
    async def get_favorited_property_ids(self, user_id: UUID) -> list[UUID]: ...
