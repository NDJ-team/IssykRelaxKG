from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4


INSUFFICIENT_MAIN = "Insufficient main balance"
INSUFFICIENT_REVENUE = "Insufficient revenue balance"


@dataclass
class Wallet:
    id: UUID
    user_id: UUID
    main_balance: Decimal
    revenue_balance: Decimal
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(cls, user_id: UUID) -> Wallet:
        now = datetime.now()
        return cls(
            id=uuid4(),
            user_id=user_id,
            main_balance=Decimal("0"),
            revenue_balance=Decimal("0"),
            created_at=now,
            updated_at=now,
        )

    def deposit(self, amount: Decimal) -> None:
        self.main_balance += amount
        self.updated_at = datetime.now()

    def hold(self, amount: Decimal) -> None:
        if self.main_balance < amount:
            raise ValueError(INSUFFICIENT_MAIN)
        self.main_balance -= amount
        self.revenue_balance += amount
        self.updated_at = datetime.now()

    def refund(self, amount: Decimal) -> None:
        if self.revenue_balance < amount:
            raise ValueError(INSUFFICIENT_REVENUE)
        self.revenue_balance -= amount
        self.main_balance += amount
        self.updated_at = datetime.now()

    def settle(self, amount: Decimal) -> None:
        if self.revenue_balance < amount:
            raise ValueError(INSUFFICIENT_REVENUE)
        self.revenue_balance -= amount
        self.updated_at = datetime.now()

    def receive(self, amount: Decimal) -> None:
        self.main_balance += amount
        self.updated_at = datetime.now()

    def withdraw(self, amount: Decimal) -> None:
        if self.main_balance < amount:
            raise ValueError(INSUFFICIENT_MAIN)
        self.main_balance -= amount
        self.updated_at = datetime.now()
