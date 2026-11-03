"""Add pickup_requests table.

Revision ID: 20231103_pickup_requests
Revises: 20231102_core_tables
Create Date: 2026-10-28
"""

from alembic import op
import sqlalchemy as sa

revision = "20231103_pickup_requests"
down_revision = "20231102_core_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "pickup_requests",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column(
            "requester_id", sa.Integer, sa.ForeignKey("requesters.id"), nullable=False
        ),
        sa.Column("area_id", sa.Integer, sa.ForeignKey("areas.id"), nullable=False),
        sa.Column(
            "status",
            sa.Enum("pending", "accepted", "completed", "cancelled", name="requeststatus"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column(
            "requested_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("pickup_requests")
    op.execute("DROP TYPE IF EXISTS requeststatus")
