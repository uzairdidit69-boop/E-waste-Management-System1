"""Import all model classes and expose Base metadata for Alembic autogenerate.
"""

from .base import Base
from .areas import Area
from .users import User
from .requesters import Requester
from .collectors import Collector
from .recyclers import Recycler
from .recycler_admins import RecyclerAdmin
from .collector_areas import collector_areas
from .pickup_requests import PickupRequest, RequestStatus
from .item_categories import ItemCategory

__all__ = [
    "Base",
    "Area",
    "User",
    "Requester",
    "Collector",
    "Recycler",
    "RecyclerAdmin",
    "collector_areas",
    "PickupRequest",
    "RequestStatus",
    "ItemCategory",
]
