# Initial Alembic migration (placeholder)
"""empty migration to initialize Alembic version history"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20231028_initial"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # No tables created yet – real schema will be added in later migrations.
    pass

def downgrade():
    # Nothing to downgrade.
    pass
