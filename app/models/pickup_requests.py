"""SQLAlchemy model for pickup requests.

A requester creates a request for waste collection in a specific area.
Status follows the workflow defined in the requirements.
"""

import enum
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum as SAEnum, Text, func
from .base import Base

class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PickupRequest(Base):
    __tablename__ = "pickup_requests"

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("requesters.id"), nullable=False)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    status = Column(SAEnum(RequestStatus), nullable=False, server_default="pending")
    description = Column(Text, nullable=True)
    requested_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<PickupRequest id={self.id} status={self.status}>"
