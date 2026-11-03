"""Create areas, users, item_categories and pickup_requests tables.

Revision ID: 20231101_areas_users
Revises: 20231028_initial
Create Date: 2026-10-28
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20231101_areas_users"
down_revision = "20231028_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # -------------------------------------------------
    # areas table
    # -------------------------------------------------
    op.create_table(
        "areas",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True, index=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # -------------------------------------------------
    # users table
    # -------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("requester", "collector", "recycler", "admin", name="userrole"),
            nullable=False,
            server_default="requester",
        ),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("area_id", sa.Integer, sa.ForeignKey("areas.id"), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # -------------------------------------------------
    # item_categories table
    # -------------------------------------------------
    op.create_table(
        "item_categories",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True, index=True),
        sa.Column("description", sa.Text, nullable=True),
    )


def downgrade() -> None:
    op.drop_table("item_categories")
    op.drop_table("users")
    op.drop_table("areas")
    op.execute("DROP TYPE IF EXISTS userrole")
