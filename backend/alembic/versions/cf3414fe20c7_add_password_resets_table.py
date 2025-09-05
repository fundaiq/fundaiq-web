"""Add password_resets table

Revision ID: add_password_resets_table
Revises: # Replace with your previous migration revision ID
Create Date: 2025-01-XX XX:XX:XX.XXXXXX

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_password_resets_table'
down_revision = 'acbe7f5c88cc'
branch_labels = None
depends_on = None


def upgrade():
    # Create password_resets table
    op.create_table(
        'password_resets',
        sa.Column('token_hash', sa.String(length=128), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),  # UUID stored as string
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('token_hash')
    )
    
    # Create index on token_hash (already primary key, but explicit for clarity)
    op.create_index('ix_password_resets_token_hash', 'password_resets', ['token_hash'])


def downgrade():
    # Drop the table and its indexes
    op.drop_index('ix_password_resets_token_hash', table_name='password_resets')
    op.drop_table('password_resets')