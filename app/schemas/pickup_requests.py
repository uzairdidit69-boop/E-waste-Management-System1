# app/schemas/pickup_requests.py
"""Pydantic schemas for pickup requests."""

from datetime import datetime
from pydantic import BaseModel
from app.models.pickup_requests import RequestStatus


class PickupRequestCreate(BaseModel):
    area_id: int
    description: str | None = None
    scheduled_at: datetime | None = None


class PickupRequestUpdate(BaseModel):
    status: RequestStatus | None = None
    scheduled_at: datetime | None = None
    completed_at: datetime | None = None
    description: str | None = None


class PickupRequestRead(BaseModel):
    id: int
    requester_id: int
    area_id: int
    status: RequestStatus
    description: str | None
    requested_at: datetime
    scheduled_at: datetime | None
    completed_at: datetime | None

    model_config = {"from_attributes": True}
