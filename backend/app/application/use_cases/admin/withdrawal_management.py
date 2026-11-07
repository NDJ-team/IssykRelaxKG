from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.admin_dto import WithdrawalListResponse, WithdrawalResponse
from app.domain.entities.transaction import TransactionStatus, TransactionType
from app.infrastructure.database.models.wallet_transaction import WalletTransactionModel


class AdminListWithdrawalsUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(self, status: str | None = None) -> WithdrawalListResponse:
        base = select(WalletTransactionModel).where(WalletTransactionModel.type == TransactionType.WITHDRAWAL)
        count_base = select(func.count()).select_from(WalletTransactionModel).where(WalletTransactionModel.type == TransactionType.WITHDRAWAL)
        if status:
            base = base.where(WalletTransactionModel.status == status)
            count_base = count_base.where(WalletTransactionModel.status == status)
        count_result = await self._session.execute(count_base)
        total = count_result.scalar() or 0
        result = await self._session.execute(base.order_by(WalletTransactionModel.created_at.desc()))
        items = [
            WithdrawalResponse(
                id=str(row.id),
                wallet_id=str(row.wallet_id),
                amount=float(row.amount),
                type="withdrawal",
                status=row.status,
                note=row.note,
                created_at=row.created_at.isoformat() if row.created_at else "",
            )
            for row in result.scalars().all()
        ]
        return WithdrawalListResponse(items=items, total=total)


class AdminApproveWithdrawalUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(self, transaction_id: UUID) -> WithdrawalResponse:
        result = await self._session.execute(
            select(WalletTransactionModel).where(
                WalletTransactionModel.id == transaction_id,
                WalletTransactionModel.type == TransactionType.WITHDRAWAL,
            )
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Withdrawal not found")

        model.status = TransactionStatus.COMPLETED
        await self._session.flush()

        return WithdrawalResponse(
            id=str(model.id),
            wallet_id=str(model.wallet_id),
            amount=float(model.amount),
            type="withdrawal",
            status=model.status,
            note=model.note,
            created_at=model.created_at.isoformat() if model.created_at else "",
        )


class AdminRejectWithdrawalUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(self, transaction_id: UUID) -> WithdrawalResponse:
        result = await self._session.execute(
            select(WalletTransactionModel).where(
                WalletTransactionModel.id == transaction_id,
                WalletTransactionModel.type == TransactionType.WITHDRAWAL,
            )
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Withdrawal not found")

        model.status = TransactionStatus.FAILED
        await self._session.flush()

        return WithdrawalResponse(
            id=str(model.id),
            wallet_id=str(model.wallet_id),
            amount=float(model.amount),
            type="withdrawal",
            status=model.status,
            note=model.note,
            created_at=model.created_at.isoformat() if model.created_at else "",
        )
