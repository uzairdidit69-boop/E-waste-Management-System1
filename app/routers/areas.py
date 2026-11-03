# app/routers/areas.py
"""Areas router: CRUD for geographical areas."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_user
from app.models.areas import Area
from app.models.users import User, UserRole
from app.schemas.areas import AreaCreate, AreaRead

router = APIRouter()


@router.get("/", response_model=list[AreaRead])
async def list_areas(db: AsyncSession = Depends(get_db)):
    """Return all registered areas (public endpoint)."""
    result = await db.execute(select(Area).order_by(Area.name))
    return result.scalars().all()


@router.get("/{area_id}", response_model=AreaRead)
async def get_area(area_id: int, db: AsyncSession = Depends(get_db)):
    """Return a single area by ID."""
    area = await db.get(Area, area_id)
    if area is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Area not found")
    return area


@router.post("/", response_model=AreaRead, status_code=status.HTTP_201_CREATED)
async def create_area(
    body: AreaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new area. Admin-only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    area = Area(name=body.name, description=body.description)
    db.add(area)
    await db.commit()
    await db.refresh(area)
    return area


@router.delete("/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_area(
    area_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an area by ID. Admin-only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    area = await db.get(Area, area_id)
    if area is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Area not found")
    await db.delete(area)
    await db.commit()
