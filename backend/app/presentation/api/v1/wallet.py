from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.wallet.deposit import DepositUseCase
from app.application.use_cases.wallet.get_wallet import GetWalletUseCase
from app.application.use_cases.wallet.list_transactions import ListTransactionsUseCase
from app.application.use_cases.wallet.withdraw import WithdrawUseCase
from app.core.database import get_db
from app.infrastructure.database.repositories.wallet_repository import SQLAlchemyWalletRepository
from app.presentation.api.deps import get_current_user_id

router = APIRouter(prefix="/wallet", tags=["wallet"])


class DepositRequest(BaseModel):
    amount: float
    note: str | None = None


class WithdrawRequest(BaseModel):
    amount: float
    note: str | None = None


@router.get("")
async def get_wallet(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyWalletRepository(session)
    use_case = GetWalletUseCase(repo)
    return await use_case.execute(user_id)


@router.get("/transactions")
async def list_transactions(
    tx_type: str | None = Query(None, alias="type"),
    status: str | None = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyWalletRepository(session)
    use_case = ListTransactionsUseCase(repo)
    return await use_case.execute(user_id, tx_type=tx_type, status=status, offset=offset, limit=limit)


@router.post("/deposit")
async def deposit(
    request: DepositRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    if request.amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be positive")

    repo = SQLAlchemyWalletRepository(session)
    use_case = DepositUseCase(repo)
    return await use_case.execute(user_id, Decimal(str(request.amount)), note=request.note)


@router.post("/withdraw")
async def withdraw(
    request: WithdrawRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    if request.amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be positive")

    repo = SQLAlchemyWalletRepository(session)
    use_case = WithdrawUseCase(repo)
    try:
        return await use_case.execute(user_id, Decimal(str(request.amount)), note=request.note)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
