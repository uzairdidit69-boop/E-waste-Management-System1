"""SQLAlchemy model for item categories.

Categories classify waste items (e.g., "Electronics", "Batteries").
"""

from sqlalchemy import Column, Integer, String, Text
from .base import Base

class ItemCategory(Base):
    __tablename__ = "item_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<ItemCategory id={self.id} name={self.name}>"
