"""Add local host profiles and local experiences

Revision ID: 2f4a6b8c0d1e
Revises: bf1c2d3e4f5g
Create Date: 2026-11-07 12:00:00.000000

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "2f4a6b8c0d1e"
down_revision: str | None = "bf1c2d3e4f5g"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "local_host_profiles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("experience_years", sa.Integer(), nullable=True),
        sa.Column("languages", sa.String(255), nullable=True),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_local_host_profiles_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_local_host_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_local_host_profiles_user_id")),
    )
    op.create_index(op.f("ix_local_host_profiles_user_id"), "local_host_profiles", ["user_id"])

    op.create_table(
        "local_experiences",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("host_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default=sa.text("'KGS'")),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("max_guests", sa.Integer(), nullable=False, server_default=sa.text("6")),
        sa.Column("city_id", sa.UUID(), nullable=True),
        sa.Column("address", sa.String(255), nullable=True),
        sa.Column("latitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("longitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("images", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("includes", sa.Text(), nullable=True),
        sa.Column("languages", sa.String(255), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], name=op.f("fk_local_experiences_city_id_cities")),
        sa.ForeignKeyConstraint(["host_id"], ["local_host_profiles.id"], name=op.f("fk_local_experiences_host_id_local_host_profiles")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_local_experiences")),
    )
    op.create_index(op.f("ix_local_experiences_host_id"), "local_experiences", ["host_id"])
    op.create_index(op.f("ix_local_experiences_category"), "local_experiences", ["category"])
    op.create_index(op.f("ix_local_experiences_city_id"), "local_experiences", ["city_id"])
    op.create_index(op.f("ix_local_experiences_status"), "local_experiences", ["status"])
    op.create_index(
        "ix_local_experiences_coordinates",
        "local_experiences",
        ["latitude", "longitude"],
    )


def downgrade() -> None:
    op.drop_index("ix_local_experiences_coordinates", table_name="local_experiences")
    op.drop_index(op.f("ix_local_experiences_status"), table_name="local_experiences")
    op.drop_index(op.f("ix_local_experiences_city_id"), table_name="local_experiences")
    op.drop_index(op.f("ix_local_experiences_category"), table_name="local_experiences")
    op.drop_index(op.f("ix_local_experiences_host_id"), table_name="local_experiences")
    op.drop_table("local_experiences")
    op.drop_index(op.f("ix_local_host_profiles_user_id"), table_name="local_host_profiles")
    op.drop_table("local_host_profiles")
