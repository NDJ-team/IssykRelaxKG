from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.transaction import Transaction as TransactionEntity
from app.domain.entities.wallet import Wallet as WalletEntity
from app.domain.interfaces.repositories.wallet_repository import WalletRepository
from app.infrastructure.database.models.wallet import WalletModel
from app.infrastructure.database.models.wallet_transaction import WalletTransactionModel


class SQLAlchemyWalletRepository(WalletRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_for_user(self, user_id: UUID) -> WalletEntity:
        wallet = WalletEntity.create(user_id)
        model = WalletModel(
            id=wallet.id,
            user_id=wallet.user_id,
            main_balance=float(wallet.main_balance),
            revenue_balance=float(wallet.revenue_balance),
            created_at=wallet.created_at,
            updated_at=wallet.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return wallet

    async def get_by_user_id(self, user_id: UUID) -> WalletEntity | None:
        result = await self._session.execute(select(WalletModel).where(WalletModel.user_id == user_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, wallet: WalletEntity) -> WalletEntity:
        result = await self._session.execute(select(WalletModel).where(WalletModel.id == wallet.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Wallet not found")

        model.main_balance = float(wallet.main_balance)
        model.revenue_balance = float(wallet.revenue_balance)
        model.updated_at = wallet.updated_at
        await self._session.flush()
        return wallet

    async def add_transaction(self, transaction: TransactionEntity) -> TransactionEntity:
        model = WalletTransactionModel(
            id=transaction.id,
            wallet_id=transaction.wallet_id,
            booking_id=transaction.booking_id,
            amount=float(transaction.amount),
            type=transaction.type,
            status=transaction.status,
            note=transaction.note,
            created_at=transaction.created_at,
        )
        self._session.add(model)
        await self._session.flush()
        return transaction

    async def get_transactions(
        self, wallet_id: UUID, tx_type: str | None = None, status: str | None = None, offset: int = 0, limit: int = 20
    ) -> list[TransactionEntity]:
        stmt = select(WalletTransactionModel).where(WalletTransactionModel.wallet_id == wallet_id)
        if tx_type:
            stmt = stmt.where(WalletTransactionModel.type == tx_type)
        if status:
            stmt = stmt.where(WalletTransactionModel.status == status)
        stmt = stmt.order_by(WalletTransactionModel.created_at.desc()).offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        return [self._to_transaction_entity(m) for m in result.scalars().all()]

    async def get_transactions_count(self, wallet_id: UUID, tx_type: str | None = None, status: str | None = None) -> int:
        stmt = select(func.count()).select_from(WalletTransactionModel).where(WalletTransactionModel.wallet_id == wallet_id)
        if tx_type:
            stmt = stmt.where(WalletTransactionModel.type == tx_type)
        if status:
            stmt = stmt.where(WalletTransactionModel.status == status)
        result = await self._session.execute(stmt)
        return result.scalar() or 0

    def _to_entity(self, model: WalletModel) -> WalletEntity:
        return WalletEntity(
            id=model.id,
            user_id=model.user_id,
            main_balance=Decimal(str(model.main_balance)),
            revenue_balance=Decimal(str(model.revenue_balance)),
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_transaction_entity(self, model: WalletTransactionModel) -> TransactionEntity:
        return TransactionEntity(
            id=model.id,
            wallet_id=model.wallet_id,
            booking_id=model.booking_id,
            amount=Decimal(str(model.amount)),
            type=model.type,
            status=model.status,
            note=model.note,
            created_at=model.created_at,
        )
