"""Add guide_profiles and tours tables

Revision ID: 0f6a7b8c9d0e
Revises: 9e5f6a7b8c9d
Create Date: 2026-06-20 14:00:00.000000

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0f6a7b8c9d0e"
down_revision: str | None = "9e5f6a7b8c9d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "guide_profiles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("languages", sa.String(255), nullable=True),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_guide_profiles_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_guide_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_guide_profiles_user_id")),
    )
    op.create_index(op.f("ix_guide_profiles_user_id"), "guide_profiles", ["user_id"])

    op.create_table(
        "tours",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("guide_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default=sa.text("'KGS'")),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("max_guests", sa.Integer(), nullable=False, server_default=sa.text("10")),
        sa.Column("includes", sa.Text(), nullable=True),
        sa.Column("meeting_point", sa.String(255), nullable=True),
        sa.Column("city_id", sa.UUID(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], name=op.f("fk_tours_city_id_cities")),
        sa.ForeignKeyConstraint(["guide_id"], ["guide_profiles.id"], name=op.f("fk_tours_guide_id_guide_profiles")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_tours")),
    )
    op.create_index(op.f("ix_tours_guide_id"), "tours", ["guide_id"])


def downgrade() -> None:
    op.drop_table("tours")
    op.drop_table("guide_profiles")
