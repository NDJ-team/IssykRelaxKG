from __future__ import annotations

from uuid import UUID

from app.domain.interfaces.repositories.wallet_repository import WalletRepository


class GetWalletUseCase:
    def __init__(self, wallet_repo: WalletRepository) -> None:
        self._wallet_repo = wallet_repo

    async def execute(self, user_id: UUID) -> dict:
        wallet = await self._wallet_repo.get_by_user_id(user_id)
        if not wallet:
            wallet = await self._wallet_repo.create_for_user(user_id)

        return {
            "id": str(wallet.id),
            "user_id": str(wallet.user_id),
            "main_balance": float(wallet.main_balance),
            "revenue_balance": float(wallet.revenue_balance),
            "created_at": wallet.created_at.isoformat(),
            "updated_at": wallet.updated_at.isoformat(),
        }
