"""SQLAlchemy association table linking collectors to the areas they serve.

A collector can serve multiple areas and an area can have multiple collectors.
"""

from sqlalchemy import Table, Column, Integer, ForeignKey, UniqueConstraint
from .base import Base

collector_areas = Table(
    "collector_areas",
    Base.metadata,
    Column("collector_id", Integer, ForeignKey("collectors.id"), primary_key=True),
    Column("area_id", Integer, ForeignKey("areas.id"), primary_key=True),
    UniqueConstraint("collector_id", "area_id", name="uq_collector_area"),
)
