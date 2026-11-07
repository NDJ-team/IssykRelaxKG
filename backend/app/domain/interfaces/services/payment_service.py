from __future__ import annotations

from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Any


class PaymentService(ABC):
    @abstractmethod
    async def create_payment(self, amount: Decimal, currency: str, description: str) -> dict[str, Any]: ...

    @abstractmethod
    async def confirm_payment(self, payment_id: str) -> dict[str, Any]: ...

    @abstractmethod
    async def refund_payment(self, payment_id: str) -> dict[str, Any]: ...
