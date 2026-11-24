"""SQLAlchemy model for recycler profile extending a user.

Recyclers are users who manage the processing facilities.
"""

from sqlalchemy import Column, Integer, ForeignKey
from .base import Base

class Recycler(Base):
    __tablename__ = "recyclers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    def __repr__(self) -> str:
        return f"<Recycler id={self.id} user_id={self.user_id}>"
