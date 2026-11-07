from __future__ import annotations

from uuid import UUID

from app.domain.interfaces.repositories.wallet_repository import WalletRepository


class ListTransactionsUseCase:
    def __init__(self, wallet_repo: WalletRepository) -> None:
        self._wallet_repo = wallet_repo

    async def execute(
        self,
        user_id: UUID,
        tx_type: str | None = None,
        status: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> dict:
        wallet = await self._wallet_repo.get_by_user_id(user_id)
        if not wallet:
            return {"items": [], "total": 0}

        transactions = await self._wallet_repo.get_transactions(
            wallet.id, tx_type=tx_type, status=status, offset=offset, limit=limit
        )
        total = await self._wallet_repo.get_transactions_count(wallet.id, tx_type=tx_type, status=status)

        return {
            "items": [
                {
                    "id": str(t.id),
                    "wallet_id": str(t.wallet_id),
                    "booking_id": str(t.booking_id) if t.booking_id else None,
                    "amount": float(t.amount),
                    "type": t.type,
                    "status": t.status,
                    "note": t.note,
                    "created_at": t.created_at.isoformat(),
                }
                for t in transactions
            ],
            "total": total,
        }
