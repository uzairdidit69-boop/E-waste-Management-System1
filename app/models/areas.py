"""SQLAlchemy model for geographical areas used throughout the system.

Each area represents a city / district / region where waste collection can occur.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, func
from .base import Base

class Area(Base):
    __tablename__ = "areas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<Area id={self.id} name={self.name}>"
