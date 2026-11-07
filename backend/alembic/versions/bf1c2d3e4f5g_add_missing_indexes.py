"""add_missing_indexes_for_wallet_and_favorites

Revision ID: bf1c2d3e4f5g
Revises: acbd1234e5f6
Create Date: 2026-06-20 18:30:00.000000
"""
from __future__ import annotations

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "bf1c2d3e4f5g"
down_revision: str | None = "acbd1234e5f6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Composite index on wallet_transactions for wallet_id + created_at queries
    # This speeds up queries like "get all transactions for wallet X ordered by date"
    op.create_index(
        "ix_wallet_transactions_wallet_created",
        "wallet_transactions",
        ["wallet_id", sa.text("created_at DESC")],
        postgresql_using="btree",
    )


def downgrade() -> None:
    op.drop_index("ix_wallet_transactions_wallet_created", table_name="wallet_transactions")
