"""add reset_token and reset_token_expires_at to users

Revision ID: acbd1234e5f6
Revises: 3c9d0e1f2a3b
Create Date: 2026-06-20 18:00:00.000000
"""
from __future__ import annotations

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "acbd1234e5f6"
down_revision: str | None = "3c9d0e1f2a3b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("reset_token", sa.String(255), nullable=True, index=True))
    op.add_column("users", sa.Column("reset_token_expires_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "reset_token_expires_at")
    op.drop_column("users", "reset_token")
