"""add_guest_owner_confirmed_to_bookings

Revision ID: 9599b1907258
Revises: 2a8b3c4d5e6f
Create Date: 2026-06-16 06:55:39.778680
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '9599b1907258'
down_revision: Union[str, None] = '2a8b3c4d5e6f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('bookings', sa.Column('guest_confirmed', sa.Boolean(), nullable=True))
    op.add_column('bookings', sa.Column('owner_confirmed', sa.Boolean(), nullable=True))
    op.execute("UPDATE bookings SET guest_confirmed = FALSE WHERE guest_confirmed IS NULL")
    op.execute("UPDATE bookings SET owner_confirmed = FALSE WHERE owner_confirmed IS NULL")
    op.alter_column('bookings', 'guest_confirmed', nullable=False)
    op.alter_column('bookings', 'owner_confirmed', nullable=False)


def downgrade() -> None:
    op.drop_column('bookings', 'owner_confirmed')
    op.drop_column('bookings', 'guest_confirmed')
