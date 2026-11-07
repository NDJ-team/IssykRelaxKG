from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.transaction import Transaction
from app.domain.entities.wallet import Wallet


class WalletRepository(ABC):
    @abstractmethod
    async def create_for_user(self, user_id: UUID) -> Wallet: ...

    @abstractmethod
    async def get_by_user_id(self, user_id: UUID) -> Wallet | None: ...

    @abstractmethod
    async def update(self, wallet: Wallet) -> Wallet: ...

    @abstractmethod
    async def add_transaction(self, transaction: Transaction) -> Transaction: ...

    @abstractmethod
    async def get_transactions(
        self, wallet_id: UUID, tx_type: str | None = None, status: str | None = None, offset: int = 0, limit: int = 20
    ) -> list[Transaction]: ...

    @abstractmethod
    async def get_transactions_count(self, wallet_id: UUID, tx_type: str | None = None, status: str | None = None) -> int: ...
