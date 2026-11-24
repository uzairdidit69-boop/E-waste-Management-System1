from __future__ import annotations

# app/main.py
"""FastAPI application entry point for the E-Waste Management System."""

import logging
import re
import traceback
from fastapi import Depends, FastAPI, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import settings
from .db import get_db, get_session_local
from .routers import areas, auth, pickup_requests, users

logger = logging.getLogger("ecotrack")

app = FastAPI(
    title="EcoTrack API",
    description="Backend API for managing e-waste pickup requests, collectors, and recyclers.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url=None,
    openapi_url="/api/openapi.json",
    redirect_slashes=False,
)

# Global exception handler for unhandled errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None),
        )
    if isinstance(exc, RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors()},
        )
    tb = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    # Mask any potential database credentials in logs
    clean_tb = re.sub(r"://[^:]+:[^@]+@", "://***:***@", tb)
    logger.error("Unhandled Exception at %s %s:\n%s", request.method, request.url.path, clean_tb)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
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
async def health_db_check():
    """Health-check endpoint validating live database connection."""
    try:
        session_factory = get_session_local()
        if session_factory is None:
            raise RuntimeError("Database session factory could not be initialized")
        async with session_factory() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as exc:
        clean_msg = re.sub(r"://[^:]+:[^@]+@", "://***:***@", str(exc))
        raw_prefix = repr(settings.DATABASE_URL[:20]) if settings.DATABASE_URL else "None"
        logger.error("Health DB check failed: [%s] %s (len=%d, raw_prefix=%s)", exc.__class__.__name__, clean_msg, len(settings.DATABASE_URL or ""), raw_prefix)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"detail": "Database unavailable"},
        )

