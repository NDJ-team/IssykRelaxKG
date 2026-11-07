from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.local_experience import LocalExperience, LocalHostProfile


class LocalExperienceRepository(ABC):
    @abstractmethod
    async def create_profile(self, profile: LocalHostProfile) -> LocalHostProfile: ...

    @abstractmethod
    async def get_profile_by_user_id(self, user_id: UUID) -> LocalHostProfile | None: ...

    @abstractmethod
    async def get_profile_by_id(self, profile_id: UUID) -> LocalHostProfile | None: ...

    @abstractmethod
    async def create_experience(self, experience: LocalExperience) -> LocalExperience: ...

    @abstractmethod
    async def get_experience_by_id(self, experience_id: UUID) -> LocalExperience | None: ...

    @abstractmethod
    async def list_experiences(
        self,
        city_id: UUID | None = None,
        category: str | None = None,
        query: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[LocalExperience], int]: ...

    @abstractmethod
    async def list_by_host(
        self,
        host_id: UUID,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[LocalExperience], int]: ...

    @abstractmethod
    async def update_experience(self, experience: LocalExperience) -> LocalExperience: ...
