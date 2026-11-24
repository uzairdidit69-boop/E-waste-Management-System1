"""SQLAlchemy model linking a site admin (user) to a recycler.

Each entry represents an admin user responsible for a particular recycler.
"""

from sqlalchemy import Column, Integer, ForeignKey
from .base import Base

class RecyclerAdmin(Base):
    __tablename__ = "recycler_admins"

    id = Column(Integer, primary_key=True, index=True)
    recycler_id = Column(Integer, ForeignKey("recyclers.id"), nullable=False)
    admin_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    def __repr__(self) -> str:
        return f"<RecyclerAdmin id={self.id} recycler_id={self.recycler_id} admin_user_id={self.admin_user_id}>"
