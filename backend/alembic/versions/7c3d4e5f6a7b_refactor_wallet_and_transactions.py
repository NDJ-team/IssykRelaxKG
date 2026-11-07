"""Refactor wallet (user_id, main/revenue) + wallet_transactions table

Revision ID: 7c3d4e5f6a7b
Revises: 6b2c3d4e5f6a
Create Date: 2026-06-20 11:00:00.000000

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "7c3d4e5f6a7b"
down_revision: str | None = "6b2c3d4e5f6a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TABLE wallets RENAME COLUMN owner_id TO user_id")
    op.execute("ALTER TABLE wallets RENAME COLUMN available_balance TO main_balance")
    op.execute("ALTER TABLE wallets RENAME COLUMN pending_balance TO revenue_balance")
    op.execute("ALTER INDEX ix_wallets_owner_id RENAME TO ix_wallets_user_id")
    op.drop_constraint("fk_wallets_owner_id_users", "wallets", type_="foreignkey")
    op.create_foreign_key(op.f("fk_wallets_user_id_users"), "wallets", "users", ["user_id"], ["id"])

    op.drop_table("transactions")

    op.create_table(
        "wallet_transactions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("wallet_id", sa.UUID(), nullable=False),
        sa.Column("booking_id", sa.UUID(), nullable=True),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'completed'")),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["wallet_id"], ["wallets.id"], name=op.f("fk_wallet_transactions_wallet_id_wallets")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_wallet_transactions")),
    )
    op.create_index(op.f("ix_wallet_transactions_wallet_id"), "wallet_transactions", ["wallet_id"])


def downgrade() -> None:
    op.drop_table("wallet_transactions")

    op.create_table(
        "transactions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("wallet_id", sa.UUID(), nullable=False),
        sa.Column("booking_id", sa.UUID(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], name="fk_transactions_booking_id_bookings"),
        sa.ForeignKeyConstraint(["wallet_id"], ["wallets.id"], name="fk_transactions_wallet_id_wallets"),
        sa.PrimaryKeyConstraint("id", name="pk_transactions"),
    )
    op.create_index("ix_transactions_wallet_id", "transactions", ["wallet_id"])
    op.create_index("ix_transactions_booking_id", "transactions", ["booking_id"])

    op.drop_constraint("fk_wallets_user_id_users", "wallets", type_="foreignkey")
    op.execute("ALTER TABLE wallets RENAME COLUMN user_id TO owner_id")
    op.execute("ALTER TABLE wallets RENAME COLUMN main_balance TO available_balance")
    op.execute("ALTER TABLE wallets RENAME COLUMN revenue_balance TO pending_balance")
    op.execute("ALTER INDEX ix_wallets_user_id RENAME TO ix_wallets_owner_id")
    op.create_foreign_key("fk_wallets_owner_id_users", "wallets", "users", ["owner_id"], ["id"])
