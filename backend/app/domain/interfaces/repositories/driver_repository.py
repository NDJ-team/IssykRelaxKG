from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.driver_profile import DriverProfile
from app.domain.entities.transfer import Transfer


class DriverRepository(ABC):
    @abstractmethod
    async def create_profile(self, profile: DriverProfile) -> DriverProfile: ...

    @abstractmethod
    async def get_profile_by_user_id(self, user_id: UUID) -> DriverProfile | None: ...

    @abstractmethod
    async def get_profile_by_id(self, profile_id: UUID) -> DriverProfile | None: ...

    @abstractmethod
    async def update_profile(self, profile: DriverProfile) -> DriverProfile: ...

    @abstractmethod
    async def create_transfer(self, transfer: Transfer) -> Transfer: ...

    @abstractmethod
    async def get_transfer_by_id(self, transfer_id: UUID) -> Transfer | None: ...

    @abstractmethod
    async def get_transfers_by_driver(self, driver_profile_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[Transfer], int]: ...

    @abstractmethod
    async def list_transfers(self, city_id: UUID | None = None, offset: int = 0, limit: int = 20) -> tuple[list[Transfer], int]: ...

    @abstractmethod
    async def update_transfer(self, transfer: Transfer) -> Transfer: ...

    @abstractmethod
    async def delete_transfer(self, transfer_id: UUID) -> None: ...

    @abstractmethod
    async def list_drivers(self, offset: int = 0, limit: int = 20) -> tuple[list[DriverProfile], int]: ...
