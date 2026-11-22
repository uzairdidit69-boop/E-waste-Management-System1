# app/main.py
"""FastAPI application entry point for the E-Waste Management System."""

from fastapi import Depends, FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .db import get_db
from .routers import areas, auth, pickup_requests, users

app = FastAPI(
    title="EcoTrack API",
    description="Backend API for managing e-waste pickup requests, collectors, and recyclers.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url=None,
    openapi_url="/api/openapi.json",
    redirect_slashes=False,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(areas.router, prefix="/api/areas", tags=["areas"])
app.include_router(pickup_requests.router, prefix="/api/pickup-requests", tags=["pickup-requests"])


@app.get("/api/health", tags=["health"])
async def health_check():
    """Health-check endpoint without database call."""
    return {"status": "ok"}


@app.get("/api/health/db", tags=["health"])
async def health_db_check(response: Response, db: AsyncSession = Depends(get_db)):
    """Health-check endpoint validating live database connection."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as exc:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "error", "db": "disconnected", "detail": str(exc)}
