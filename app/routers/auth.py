# app/routers/auth.py
"""Authentication router: register and login endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import create_access_token, hash_password, verify_password
from app.db import get_db
from app.models.users import User, UserRole
from app.models.requesters import Requester
from app.models.collectors import Collector
from app.models.recyclers import Recycler
from app.schemas.users import Token, UserCreate, UserLogin, UserRead

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account.

    - Hashes the password with Argon2.
    - Creates corresponding profile automatically based on role.
    """
    result = await db.execute(select(User).where(User.email == body.email.lower()))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user = User(
        email=body.email.lower(),
        hashed_password=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    await db.flush()  # gets user.id without committing

    # Auto-create profile for role
    if body.role == UserRole.REQUESTER:
        db.add(Requester(user_id=user.id))
    elif body.role == UserRole.COLLECTOR:
        db.add(Collector(user_id=user.id))
    elif body.role == UserRole.RECYCLER:
        db.add(Recycler(user_id=user.id))

    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login with email and password, returns a JWT access token."""
    result = await db.execute(select(User).where(User.email == body.email.lower()))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return Token(access_token=token)
