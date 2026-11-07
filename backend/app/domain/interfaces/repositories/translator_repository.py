from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.translator_profile import TranslatorProfile


class TranslatorRepository(ABC):
    @abstractmethod
    async def create_profile(self, profile: TranslatorProfile) -> TranslatorProfile: ...
    @abstractmethod
    async def get_profile_by_user_id(self, user_id: UUID) -> TranslatorProfile | None: ...
    @abstractmethod
    async def get_profile_by_id(self, profile_id: UUID) -> TranslatorProfile | None: ...
    @abstractmethod
    async def update_profile(self, profile: TranslatorProfile) -> TranslatorProfile: ...
    @abstractmethod
    async def list_profiles(self, offset: int = 0, limit: int = 20) -> tuple[list[TranslatorProfile], int]: ...
