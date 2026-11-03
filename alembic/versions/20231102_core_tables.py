"""Add core profile tables and collector_areas association.

Revision ID: 20231102_core_tables
Revises: 20231101_areas_users
Create Date: 2026-10-28
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20231102_core_tables"
down_revision = "20231101_areas_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # -------------------------------------------------
    # requesters table
    # -------------------------------------------------
    op.create_table(
        "requesters",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("address", sa.String(255), nullable=True),
    )

    # -------------------------------------------------
    # collectors table
    # -------------------------------------------------
    op.create_table(
        "collectors",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False, unique=True),
    )

    # -------------------------------------------------
    # recyclers table
    # -------------------------------------------------
    op.create_table(
        "recyclers",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False, unique=True),
    )

    # -------------------------------------------------
    # recycler_admins table
    # -------------------------------------------------
    op.create_table(
        "recycler_admins",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("recycler_id", sa.Integer, sa.ForeignKey("recyclers.id"), nullable=False),
        sa.Column("admin_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
    )

    # -------------------------------------------------
    # collector_areas association table (many‑to‑many)
    # -------------------------------------------------
    op.create_table(
        "collector_areas",
        sa.Column("collector_id", sa.Integer, sa.ForeignKey("collectors.id"), primary_key=True),
        sa.Column("area_id", sa.Integer, sa.ForeignKey("areas.id"), primary_key=True),
        sa.UniqueConstraint("collector_id", "area_id", name="uq_collector_area"),
    )


def downgrade() -> None:
    op.drop_table("collector_areas")
    op.drop_table("recycler_admins")
    op.drop_table("recyclers")
    op.drop_table("collectors")
    op.drop_table("requesters")
