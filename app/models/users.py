"""SQLAlchemy model for users of the E‑waste platform.

Roles are defined as an Enum matching the specification (requester, collector, recycler, admin).
Password is stored as a hashed string (argon2). Email is stored lower‑cased and unique.
"""

import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SAEnum, ForeignKey, func
from .base import Base

class UserRole(str, enum.Enum):
    REQUESTER = "requester"
    COLLECTOR = "collector"
    RECYCLER = "recycler"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.REQUESTER)
    is_active = Column(Boolean, nullable=False, default=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
