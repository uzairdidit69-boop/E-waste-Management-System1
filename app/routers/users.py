# app/routers/users.py
"""Users router: read current user profile."""

from fastapi import APIRouter, Depends
from app.deps import get_current_user
from app.models.users import User
from app.schemas.users import UserRead

router = APIRouter()


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return current_user
