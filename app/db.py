# app/db.py
"""Async SQLAlchemy engine and session factory for the E-Waste Management System."""

import logging
import urllib.parse
from typing import Any
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool, StaticPool

from .config import settings

logger = logging.getLogger("ecotrack")


def normalize_database_url(raw_url: str) -> tuple[str, dict[str, Any], type]:
    """Convert DB URL to asyncpg format and configure connect_args/poolclass.

    - Strips unsupported query parameters (sslmode, channel_binding) for asyncpg.
    - Sets SSL to 'require' and disables statement cache for PgBouncer / Neon pooling.
    - Uses NullPool for serverless PostgreSQL and file SQLite; StaticPool for in-memory SQLite.
    """
    if not raw_url:
        logger.warning("DATABASE_URL is empty; falling back to temporary in-memory SQLite engine")
        return "sqlite+aiosqlite:///:memory:", {}, StaticPool

    url = raw_url
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)

    connect_args: dict[str, Any] = {}
    if "asyncpg" in url:
        parsed = urllib.parse.urlsplit(url)
        q_params = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
        # asyncpg does not understand sslmode or channel_binding
        filtered_q = [(k, v) for k, v in q_params if k not in ("sslmode", "channel_binding")]
        new_query = urllib.parse.urlencode(filtered_q)
        url = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, parsed.path, new_query, parsed.fragment))

        connect_args = {
            "ssl": "require",
            "statement_cache_size": 0,
        }

    pool_class: type = StaticPool if ":memory:" in url else NullPool
    return url, connect_args, pool_class


engine: AsyncEngine | None = None
AsyncSessionLocal: sessionmaker | None = None
DATABASE_URL: str = ""
connect_args: dict[str, Any] = {}
pool_class: type = NullPool


def get_engine() -> AsyncEngine | None:
    """Lazily initialize and return the async engine."""
    global engine, DATABASE_URL, connect_args, pool_class
    if engine is None and settings.DATABASE_URL:
        DATABASE_URL, connect_args, pool_class = normalize_database_url(settings.DATABASE_URL)
        engine = create_async_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            poolclass=pool_class,
            connect_args=connect_args,
            echo=False,
        )
    return engine


def get_session_local() -> sessionmaker | None:
    """Lazily initialize and return the AsyncSessionLocal factory."""
    global AsyncSessionLocal
    if AsyncSessionLocal is None and settings.DATABASE_URL:
        eng = get_engine()
        if eng is not None:
            AsyncSessionLocal = sessionmaker(  # type: ignore[type-arg]
                bind=eng,
                class_=AsyncSession,
                expire_on_commit=False,
                autoflush=False,
                autocommit=False,
            )
    return AsyncSessionLocal


# Attempt startup initialization if DATABASE_URL is configured
if settings.DATABASE_URL:
    get_session_local()
else:
    logger.warning("STARTUP WARNING: DATABASE_URL is not configured; database engine initialization deferred.")


async def get_db():
    """FastAPI dependency that yields an async DB session."""
    session_factory = get_session_local()
    if session_factory is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not configured. DATABASE_URL environment variable is missing.",
        )
    async with session_factory() as session:
        yield session
