# app/routers/pickup_requests.py
"""Pickup requests router: role-based CRUD and lifecycle for waste pickup requests."""

from datetime import datetime, UTC
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_user
from app.models.collectors import Collector
from app.models.pickup_requests import PickupRequest, RequestStatus
from app.models.requesters import Requester
from app.models.users import User, UserRole
from app.schemas.pickup_requests import (
    PickupRequestCreate,
    PickupRequestRead,
    PickupRequestUpdate,
)

router = APIRouter()

VALID_TRANSITIONS = {
    RequestStatus.PENDING: {RequestStatus.ACCEPTED, RequestStatus.CANCELLED},
    RequestStatus.ACCEPTED: {RequestStatus.COMPLETED, RequestStatus.CANCELLED},
    RequestStatus.COMPLETED: set(),
    RequestStatus.CANCELLED: set(),
}


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


async def _get_collector(user: User, db: AsyncSession) -> Collector:
    """Helper: fetch the Collector profile for the given user or 403."""
    result = await db.execute(select(Collector).where(Collector.user_id == user.id))
    collector = result.scalar_one_or_none()
    if collector is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only collectors can perform this action",
        )
    return collector


@router.get("", response_model=list[PickupRequestRead])
@router.get("/", response_model=list[PickupRequestRead], include_in_schema=False)
async def list_pickup_requests(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List pickup requests with pagination.

    - Requesters see only their own requests.
    - Collectors see pending requests and requests assigned to them.
    - Recyclers and Admins see all requests.
    """
    stmt = select(PickupRequest)
    if current_user.role == UserRole.REQUESTER:
        requester = await _get_requester(current_user, db)
        stmt = stmt.where(PickupRequest.requester_id == requester.id)
    elif current_user.role == UserRole.COLLECTOR:
        collector = await _get_collector(current_user, db)
        stmt = stmt.where(
            or_(
                PickupRequest.status == RequestStatus.PENDING,
                PickupRequest.collector_id == collector.id,
            )
        )
    # Recycler and Admin see all requests

    stmt = stmt.order_by(PickupRequest.requested_at.desc()).offset(offset).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{request_id}", response_model=PickupRequestRead)
async def get_pickup_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single pickup request with role-based authorization."""
    pr = await db.get(PickupRequest, request_id)
    if pr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if current_user.role == UserRole.REQUESTER:
        requester = await _get_requester(current_user, db)
        if pr.requester_id != requester.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif current_user.role == UserRole.COLLECTOR:
        collector = await _get_collector(current_user, db)
        if pr.status != RequestStatus.PENDING and pr.collector_id != collector.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return pr


@router.post("", response_model=PickupRequestRead, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PickupRequestRead, status_code=status.HTTP_201_CREATED, include_in_schema=False)
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
    """Update a pickup request status / schedule following the state machine:
    pending -> accepted -> completed
    pending/accepted -> cancelled
    """
    pr = await db.get(PickupRequest, request_id)
    if pr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    target_status = body.status
    if target_status is not None and target_status != pr.status:
        # Validate state machine transition
        allowed_transitions = VALID_TRANSITIONS.get(pr.status, set())
        if target_status not in allowed_transitions:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot transition status from '{pr.status.value}' to '{target_status.value}'",
            )

        # Enforce role capabilities
        if current_user.role == UserRole.REQUESTER:
            requester = await _get_requester(current_user, db)
            if pr.requester_id != requester.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
            if target_status != RequestStatus.CANCELLED:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Requesters can only cancel their own requests",
                )
        elif current_user.role == UserRole.COLLECTOR:
            collector = await _get_collector(current_user, db)
            if target_status == RequestStatus.ACCEPTED:
                if pr.status != RequestStatus.PENDING:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Only pending requests can be accepted",
                    )
                pr.collector_id = collector.id
            elif target_status == RequestStatus.COMPLETED:
                if pr.collector_id != collector.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You can only complete requests assigned to you",
                    )
                pr.completed_at = datetime.now(UTC)
            elif target_status == RequestStatus.CANCELLED:
                if pr.collector_id != collector.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You can only cancel requests assigned to you",
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Collector not authorized for this status change",
                )
        elif current_user.role == UserRole.RECYCLER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Recyclers have read-only access",
            )
        elif current_user.role == UserRole.ADMIN:
            if target_status == RequestStatus.COMPLETED:
                pr.completed_at = datetime.now(UTC)

        pr.status = target_status

    update_data = body.model_dump(exclude_unset=True, exclude={"status"})
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
