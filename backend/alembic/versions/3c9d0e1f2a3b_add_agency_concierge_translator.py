"""Add agency, concierge, and translator tables

Revision ID: 3c9d0e1f2a3b
Revises: 2b8c9d0e1f2a
Create Date: 2026-06-20 17:00:00.000000

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "3c9d0e1f2a3b"
down_revision: str | None = "2b8c9d0e1f2a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "agency_profiles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("company_name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("license_number", sa.String(100), nullable=True),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_agency_profiles_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_agency_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_agency_profiles_user_id")),
    )
    op.create_index(op.f("ix_agency_profiles_user_id"), "agency_profiles", ["user_id"])

    op.create_table(
        "tour_packages",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("agency_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default=sa.text("'KGS'")),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("max_guests", sa.Integer(), nullable=False, server_default=sa.text("10")),
        sa.Column("includes", sa.Text(), nullable=True),
        sa.Column("itinerary", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["agency_id"], ["agency_profiles.id"], name=op.f("fk_tour_packages_agency_id_agency_profiles")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_tour_packages")),
    )
    op.create_index(op.f("ix_tour_packages_agency_id"), "tour_packages", ["agency_id"])

    op.create_table(
        "concierge_profiles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("service_areas", sa.Text(), nullable=True),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_concierge_profiles_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_concierge_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_concierge_profiles_user_id")),
    )
    op.create_index(op.f("ix_concierge_profiles_user_id"), "concierge_profiles", ["user_id"])

    op.create_table(
        "translator_profiles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("languages", sa.Text(), nullable=True),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_translator_profiles_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_translator_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_translator_profiles_user_id")),
    )
    op.create_index(op.f("ix_translator_profiles_user_id"), "translator_profiles", ["user_id"])


def downgrade() -> None:
    op.drop_table("translator_profiles")
    op.drop_table("concierge_profiles")
    op.drop_table("tour_packages")
    op.drop_table("agency_profiles")
