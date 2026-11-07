from __future__ import annotations

from decimal import Decimal
from typing import Any

from app.domain.interfaces.services.payment_service import PaymentService


class StripePaymentService(PaymentService):
    async def create_payment(self, amount: Decimal, currency: str, description: str) -> dict[str, Any]:
        return {
            "id": "stub_payment_id",
            "amount": float(amount),
            "currency": currency,
            "status": "succeeded",
        }

    async def confirm_payment(self, payment_id: str) -> dict[str, Any]:
        return {"id": payment_id, "status": "succeeded"}

    async def refund_payment(self, payment_id: str) -> dict[str, Any]:
        return {"id": payment_id, "status": "refunded"}
