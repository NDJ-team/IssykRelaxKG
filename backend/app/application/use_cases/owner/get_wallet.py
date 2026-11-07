from __future__ import annotations

from uuid import UUID

from app.application.dto.owner_dto import TransactionResponse, WalletResponse
from app.domain.interfaces.repositories.wallet_repository import WalletRepository


class GetWalletUseCase:
    def __init__(self, wallet_repo: WalletRepository) -> None:
        self._wallet_repo = wallet_repo

    async def execute(self, owner_id: UUID) -> WalletResponse:
        wallet = await self._wallet_repo.get_by_user_id(owner_id)
        if not wallet:
            wallet = await self._wallet_repo.create_for_user(owner_id)

        transactions = await self._wallet_repo.get_transactions(wallet.id)

        return WalletResponse(
            available_balance=float(wallet.main_balance),
            pending_balance=float(wallet.revenue_balance),
            transactions=[
                TransactionResponse(
                    id=str(t.id),
                    booking_id=str(t.booking_id) if t.booking_id else "",
                    amount=float(t.amount),
                    type=t.type,
                    created_at=t.created_at.isoformat(),
                )
                for t in transactions
            ],
        )
