from __future__ import annotations

from pydantic import BaseModel


class TransactionResponse(BaseModel):
    id: str
    booking_id: str
    amount: float
    type: str
    created_at: str


class WalletResponse(BaseModel):
    available_balance: float
    pending_balance: float
    transactions: list[TransactionResponse] = []
