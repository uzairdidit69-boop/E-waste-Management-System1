"""SQLAlchemy model for collector profile extending a user.

Collectors are users who can be assigned to specific areas for waste collection.
"""

from sqlalchemy import Column, Integer, ForeignKey
from .base import Base

class Collector(Base):
    __tablename__ = "collectors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    def __repr__(self) -> str:
        return f"<Collector id={self.id} user_id={self.user_id}>"
