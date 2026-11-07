from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from uuid import UUID

from app.domain.entities.booking import Booking


class BookingRepository(ABC):
    @abstractmethod
    async def create(self, booking: Booking) -> Booking: ...

    @abstractmethod
    async def get_by_id(self, booking_id: UUID) -> Booking | None: ...

    @abstractmethod
    async def get_by_guest(self, guest_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[Booking], int]: ...

    @abstractmethod
    async def get_by_owner(self, owner_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[Booking], int]: ...

    @abstractmethod
    async def get_by_property(self, property_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[Booking], int]: ...

    @abstractmethod
    async def get_by_service(self, service_type: str, service_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[Booking], int]: ...

    @abstractmethod
    async def get_by_verification_code(self, code: str) -> Booking | None: ...

    @abstractmethod
    async def check_availability(self, property_id: UUID, check_in: datetime, check_out: datetime) -> bool: ...

    @abstractmethod
    async def update(self, booking: Booking) -> Booking: ...

    @abstractmethod
    async def delete(self, booking_id: UUID) -> None: ...
