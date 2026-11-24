# app/schemas/areas.py
"""Pydantic schemas for areas."""

from datetime import datetime
from pydantic import BaseModel


class AreaCreate(BaseModel):
    name: str
    description: str | None = None


class AreaRead(BaseModel):
    id: int
    name: str
    description: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
