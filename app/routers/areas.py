# app/routers/areas.py
"""Areas router: CRUD for geographical areas."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_user
from app.models.areas import Area
from app.models.users import User, UserRole
from app.schemas.areas import AreaCreate, AreaRead

router = APIRouter()


@router.get("", response_model=list[AreaRead])
@router.get("/", response_model=list[AreaRead], include_in_schema=False)
async def list_areas(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Return all registered areas with pagination (public endpoint)."""
    result = await db.execute(select(Area).order_by(Area.name).offset(offset).limit(limit))
    return result.scalars().all()


@router.get("/{area_id}", response_model=AreaRead)
async def get_area(area_id: int, db: AsyncSession = Depends(get_db)):
    """Return a single area by ID."""
    area = await db.get(Area, area_id)
    if area is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Area not found")
    return area


@router.post("", response_model=AreaRead, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=AreaRead, status_code=status.HTTP_201_CREATED, include_in_schema=False)
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
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Area with name '{body.name}' already exists",
        )
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
    try:
        await db.delete(area)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete area with existing pickup requests. Delete or reassign requests first.",
        )
