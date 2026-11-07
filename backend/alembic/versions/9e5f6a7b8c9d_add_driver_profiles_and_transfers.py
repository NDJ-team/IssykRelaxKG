"""Add driver_profiles and transfers tables

Revision ID: 9e5f6a7b8c9d
Revises: 8d4e5f6a7b8c
Create Date: 2026-06-20 13:00:00.000000

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "9e5f6a7b8c9d"
down_revision: str | None = "8d4e5f6a7b8c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "driver_profiles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("license_number", sa.String(100), nullable=True),
        sa.Column("vehicle_info", sa.String(255), nullable=True),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_driver_profiles_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_driver_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_driver_profiles_user_id")),
    )
    op.create_index(op.f("ix_driver_profiles_user_id"), "driver_profiles", ["user_id"])

    op.create_table(
        "transfers",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("driver_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("from_location", sa.String(255), nullable=False),
        sa.Column("to_location", sa.String(255), nullable=False),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default=sa.text("'KGS'")),
        sa.Column("max_passengers", sa.Integer(), nullable=False, server_default=sa.text("4")),
        sa.Column("vehicle_type", sa.String(50), nullable=True),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("city_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], name=op.f("fk_transfers_city_id_cities")),
        sa.ForeignKeyConstraint(["driver_id"], ["driver_profiles.id"], name=op.f("fk_transfers_driver_id_driver_profiles")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_transfers")),
    )
    op.create_index(op.f("ix_transfers_driver_id"), "transfers", ["driver_id"])


def downgrade() -> None:
    op.drop_table("transfers")
    op.drop_table("driver_profiles")
