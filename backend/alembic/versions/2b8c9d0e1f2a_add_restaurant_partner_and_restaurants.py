"""Add restaurant_partner_profiles and restaurants tables

Revision ID: 2b8c9d0e1f2a
Revises: 1a7b8c9d0e1f
Create Date: 2026-06-20 16:00:00.000000

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "2b8c9d0e1f2a"
down_revision: str | None = "1a7b8c9d0e1f"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "restaurant_partner_profiles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("restaurant_name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("cuisine_type", sa.String(100), nullable=True),
        sa.Column("address", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_restaurant_partner_profiles_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_restaurant_partner_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_restaurant_partner_profiles_user_id")),
    )
    op.create_index(op.f("ix_restaurant_partner_profiles_user_id"), "restaurant_partner_profiles", ["user_id"])

    op.create_table(
        "restaurants",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("partner_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("cuisine_type", sa.String(100), nullable=True),
        sa.Column("address", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("price_range", sa.String(10), nullable=True),
        sa.Column("opening_hours", sa.String(255), nullable=True),
        sa.Column("city_id", sa.UUID(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], name=op.f("fk_restaurants_city_id_cities")),
        sa.ForeignKeyConstraint(["partner_id"], ["restaurant_partner_profiles.id"], name=op.f("fk_restaurants_partner_id_restaurant_partner_profiles")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_restaurants")),
    )
    op.create_index(op.f("ix_restaurants_partner_id"), "restaurants", ["partner_id"])


def downgrade() -> None:
    op.drop_table("restaurants")
    op.drop_table("restaurant_partner_profiles")
