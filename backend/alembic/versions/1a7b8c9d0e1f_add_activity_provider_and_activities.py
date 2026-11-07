"""Add activity_provider_profiles and activities tables

Revision ID: 1a7b8c9d0e1f
Revises: 0f6a7b8c9d0e
Create Date: 2026-06-20 15:00:00.000000

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "1a7b8c9d0e1f"
down_revision: str | None = "0f6a7b8c9d0e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "activity_provider_profiles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("company_name", sa.String(255), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_activity_provider_profiles_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_activity_provider_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_activity_provider_profiles_user_id")),
    )
    op.create_index(op.f("ix_activity_provider_profiles_user_id"), "activity_provider_profiles", ["user_id"])

    op.create_table(
        "activities",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("provider_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default=sa.text("'KGS'")),
        sa.Column("max_participants", sa.Integer(), nullable=False, server_default=sa.text("10")),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("location", sa.String(255), nullable=False, server_default=sa.text("''")),
        sa.Column("city_id", sa.UUID(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], name=op.f("fk_activities_city_id_cities")),
        sa.ForeignKeyConstraint(["provider_id"], ["activity_provider_profiles.id"], name=op.f("fk_activities_provider_id_activity_provider_profiles")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_activities")),
    )
    op.create_index(op.f("ix_activities_provider_id"), "activities", ["provider_id"])


def downgrade() -> None:
    op.drop_table("activities")
    op.drop_table("activity_provider_profiles")
