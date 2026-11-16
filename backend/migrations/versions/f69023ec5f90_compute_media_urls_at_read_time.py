"""compute media urls at read time

Revision ID: f69023ec5f90
Revises: 1dbc037b4a08
Create Date: 2026-11-16 14:46:16.406087

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f69023ec5f90"
down_revision: str | Sequence[str] | None = "1dbc037b4a08"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Media URLs are now built from the stored path per response, so hosts can change."""
    op.drop_column("media", "url")


def downgrade() -> None:
    op.add_column("media", sa.Column("url", sa.Text(), nullable=False, server_default=""))
