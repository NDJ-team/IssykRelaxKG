from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from app.domain.entities.transaction import Transaction, TransactionType
from app.domain.interfaces.repositories.wallet_repository import WalletRepository


class DepositUseCase:
    def __init__(self, wallet_repo: WalletRepository) -> None:
        self._wallet_repo = wallet_repo

    async def execute(self, user_id: UUID, amount: Decimal, note: str | None = None) -> dict:
        wallet = await self._wallet_repo.get_by_user_id(user_id)
        if not wallet:
            wallet = await self._wallet_repo.create_for_user(user_id)

        wallet.deposit(amount)
        await self._wallet_repo.update(wallet)

        transaction = Transaction.create(
            wallet_id=wallet.id,
            amount=amount,
            tx_type=TransactionType.DEPOSIT,
            note=note,
        )
        await self._wallet_repo.add_transaction(transaction)

        return {
            "main_balance": float(wallet.main_balance),
            "revenue_balance": float(wallet.revenue_balance),
            "transaction_id": str(transaction.id),
        }
