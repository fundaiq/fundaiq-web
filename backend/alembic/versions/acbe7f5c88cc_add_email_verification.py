"""Add email verification

Revision ID: acbe7f5c88cc
Revises: 533587cdb00b
Create Date: 2025-08-13 23:47:08.227115

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'acbe7f5c88cc'
down_revision: Union[str, Sequence[str], None] = '533587cdb00b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
