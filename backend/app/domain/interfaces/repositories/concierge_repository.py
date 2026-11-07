from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.concierge_profile import ConciergeProfile


class ConciergeRepository(ABC):
    @abstractmethod
    async def create_profile(self, profile: ConciergeProfile) -> ConciergeProfile: ...
    @abstractmethod
    async def get_profile_by_user_id(self, user_id: UUID) -> ConciergeProfile | None: ...
    @abstractmethod
    async def get_profile_by_id(self, profile_id: UUID) -> ConciergeProfile | None: ...
    @abstractmethod
    async def update_profile(self, profile: ConciergeProfile) -> ConciergeProfile: ...
    @abstractmethod
    async def list_profiles(self, offset: int = 0, limit: int = 20) -> tuple[list[ConciergeProfile], int]: ...
