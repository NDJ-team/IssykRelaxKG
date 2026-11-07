"""add_contact_fields_to_properties

Revision ID: 2a8b3c4d5e6f
Revises: 31f7c1807a62
Create Date: 2026-06-16 12:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '2a8b3c4d5e6f'
down_revision: Union[str, None] = '31f7c1807a62'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('properties', sa.Column('instagram', sa.String(length=255), nullable=True))
    op.add_column('properties', sa.Column('telegram', sa.String(length=255), nullable=True))
    op.add_column('properties', sa.Column('whatsapp', sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column('properties', 'whatsapp')
    op.drop_column('properties', 'telegram')
    op.drop_column('properties', 'instagram')
