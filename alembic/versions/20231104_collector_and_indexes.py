"""Add collector_id to pickup_requests and performance indexes.

Revision ID: 20231104_collector_and_indexes
Revises: 20231103_pickup_requests
Create Date: 2026-11-22
"""

from alembic import op
import sqlalchemy as sa

revision = "20231104_collector_and_indexes"
down_revision = "20231103_pickup_requests"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("pickup_requests") as batch_op:
        batch_op.add_column(
            sa.Column(
                "collector_id",
                sa.Integer,
                sa.ForeignKey("collectors.id", name="fk_pickup_requests_collector_id"),
                nullable=True,
            )
        )
        batch_op.create_index("ix_pickup_requests_collector_id", ["collector_id"])
        batch_op.create_index("ix_pickup_requests_status", ["status"])
        batch_op.create_index("ix_pickup_requests_requester_id", ["requester_id"])
        batch_op.create_index("ix_pickup_requests_area_id", ["area_id"])


def downgrade() -> None:
    with op.batch_alter_table("pickup_requests") as batch_op:
        batch_op.drop_index("ix_pickup_requests_area_id")
        batch_op.drop_index("ix_pickup_requests_requester_id")
        batch_op.drop_index("ix_pickup_requests_status")
        batch_op.drop_index("ix_pickup_requests_collector_id")
        batch_op.drop_column("collector_id")
