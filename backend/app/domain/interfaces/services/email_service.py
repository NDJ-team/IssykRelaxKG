from __future__ import annotations

from abc import ABC, abstractmethod


class EmailService(ABC):
    @abstractmethod
    async def send_email(self, to: str, subject: str, body: str) -> None: ...

    @abstractmethod
    async def send_verification(self, to: str, token: str) -> None: ...

    @abstractmethod
    async def send_password_reset(self, to: str, token: str) -> None: ...

    @abstractmethod
    async def send_booking_confirmation(self, to: str, booking_id: str) -> None: ...
