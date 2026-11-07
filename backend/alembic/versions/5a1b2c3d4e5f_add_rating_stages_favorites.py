"""Add rating_points, stages to properties + favorites table

Revision ID: 5a1b2c3d4e5f
Revises: ae483ab1cb20
Create Date: 2026-06-16 14:00:00.000000

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "5a1b2c3d4e5f"
down_revision: str | None = "ae483ab1cb20"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("properties", sa.Column("rating_points", sa.Integer(), nullable=False, server_default=sa.text("0")))
    op.add_column("properties", sa.Column("stages", sa.Integer(), nullable=False, server_default=sa.text("0")))

    op.create_table(
        "favorites",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("property_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], name=op.f("fk_favorites_property_id_properties")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_favorites_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_favorites")),
        sa.UniqueConstraint("user_id", "property_id", name="uq_favorites_user_property"),
    )
    op.create_index(op.f("ix_favorites_user_id"), "favorites", ["user_id"])
    op.create_index(op.f("ix_favorites_property_id"), "favorites", ["property_id"])


def downgrade() -> None:
    op.drop_table("favorites")
    op.drop_column("properties", "stages")
    op.drop_column("properties", "rating_points")
