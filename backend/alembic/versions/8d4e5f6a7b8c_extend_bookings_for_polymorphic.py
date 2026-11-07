"""Extend bookings for polymorphic service types

Revision ID: 8d4e5f6a7b8c
Revises: 7c3d4e5f6a7b
Create Date: 2026-06-20 12:00:00.000000

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "8d4e5f6a7b8c"
down_revision: str | None = "7c3d4e5f6a7b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("bookings", sa.Column("service_type", sa.String(50), nullable=False, server_default=sa.text("'property'")))
    op.add_column("bookings", sa.Column("service_id", sa.UUID(), nullable=True))
    op.alter_column("bookings", "property_id", existing_type=sa.UUID(), nullable=True)
    op.alter_column("bookings", "check_in", existing_type=sa.DateTime(timezone=True), nullable=True)
    op.alter_column("bookings", "check_out", existing_type=sa.DateTime(timezone=True), nullable=True)
    op.alter_column("bookings", "guest_count", existing_type=sa.Integer(), nullable=False, server_default=sa.text("1"))
    op.create_index(op.f("ix_bookings_service_id"), "bookings", ["service_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_bookings_service_id"), table_name="bookings")
    op.alter_column("bookings", "guest_count", existing_type=sa.Integer(), server_default=None)
    op.alter_column("bookings", "check_out", existing_type=sa.DateTime(timezone=True), nullable=False)
    op.alter_column("bookings", "check_in", existing_type=sa.DateTime(timezone=True), nullable=False)
    op.alter_column("bookings", "property_id", existing_type=sa.UUID(), nullable=False)
    op.drop_column("bookings", "service_id")
    op.drop_column("bookings", "service_type")
