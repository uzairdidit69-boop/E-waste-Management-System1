# app/routers/pickup_requests.py
"""Pickup requests router: full CRUD for waste pickup requests."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_user
from app.models.pickup_requests import PickupRequest, RequestStatus
from app.models.requesters import Requester
from app.models.users import User, UserRole
from app.schemas.pickup_requests import (
    PickupRequestCreate,
    PickupRequestRead,
    PickupRequestUpdate,
)

router = APIRouter()


async def _get_requester(user: User, db: AsyncSession) -> Requester:
    """Helper: fetch the Requester profile for the given user or 403."""
    result = await db.execute(select(Requester).where(Requester.user_id == user.id))
    requester = result.scalar_one_or_none()
    if requester is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only requesters can perform this action",
        )
    return requester


@router.get("/", response_model=list[PickupRequestRead])
async def list_pickup_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List pickup requests.

    - **Requesters** see only their own requests.
    - **Collectors / Admins** see all requests.
    """
    if current_user.role == UserRole.REQUESTER:
        requester = await _get_requester(current_user, db)
        result = await db.execute(
            select(PickupRequest)
            .where(PickupRequest.requester_id == requester.id)
            .order_by(PickupRequest.requested_at.desc())
        )
    else:
        result = await db.execute(
            select(PickupRequest).order_by(PickupRequest.requested_at.desc())
        )
    return result.scalars().all()


@router.get("/{request_id}", response_model=PickupRequestRead)
async def get_pickup_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single pickup request. Requesters can only see their own."""
    pr = await db.get(PickupRequest, request_id)
    if pr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if current_user.role == UserRole.REQUESTER:
        requester = await _get_requester(current_user, db)
        if pr.requester_id != requester.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return pr


@router.post("/", response_model=PickupRequestRead, status_code=status.HTTP_201_CREATED)
async def create_pickup_request(
    body: PickupRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new pickup request. Requester role required."""
    requester = await _get_requester(current_user, db)
    pr = PickupRequest(
        requester_id=requester.id,
        area_id=body.area_id,
        description=body.description,
        scheduled_at=body.scheduled_at,
        status=RequestStatus.PENDING,
    )
    db.add(pr)
    await db.commit()
    await db.refresh(pr)
    return pr


@router.patch("/{request_id}", response_model=PickupRequestRead)
async def update_pickup_request(
    request_id: int,
    body: PickupRequestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a pickup request status / schedule.

    - **Collectors** can accept or mark as completed.
    - **Requesters** can cancel their own requests.
    """
    pr = await db.get(PickupRequest, request_id)
    if pr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if current_user.role == UserRole.REQUESTER:
        requester = await _get_requester(current_user, db)
        if pr.requester_id != requester.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        # Requesters may only cancel
        if body.status and body.status != RequestStatus.CANCELLED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Requesters can only cancel their own requests",
            )

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pr, field, value)

    await db.commit()
    await db.refresh(pr)
    return pr


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pickup_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Hard-delete a pickup request. Admin-only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    pr = await db.get(PickupRequest, request_id)
    if pr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    await db.delete(pr)
    await db.commit()
