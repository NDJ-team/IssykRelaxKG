from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4


class TransactionType:
    DEPOSIT = "deposit"
    HOLD = "hold"
    RELEASE = "release"
    REFUND = "refund"
    WITHDRAWAL = "withdrawal"


class TransactionStatus:
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Transaction:
    id: UUID
    wallet_id: UUID
    booking_id: UUID | None
    amount: Decimal
    type: str
    status: str
    note: str | None
    created_at: datetime

    @classmethod
    def create(
        cls,
        wallet_id: UUID,
        amount: Decimal,
        tx_type: str,
        booking_id: UUID | None = None,
        note: str | None = None,
        status: str = TransactionStatus.COMPLETED,
    ) -> Transaction:
        return cls(
            id=uuid4(),
            wallet_id=wallet_id,
            booking_id=booking_id,
            amount=amount,
            type=tx_type,
            status=status,
            note=note,
            created_at=datetime.now(),
        )
