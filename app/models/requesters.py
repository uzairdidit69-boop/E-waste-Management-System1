"""SQLAlchemy model for requester profile extending a user.

Each requester is a normal user that can create pickup requests.
Additional optional fields (phone, address) are stored here.
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from .base import Base

class Requester(Base):
    __tablename__ = "requesters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)

    def __repr__(self) -> str:
        return f"<Requester id={self.id} user_id={self.user_id}>"
