from __future__ import annotations

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


def normalize_database_url(raw_url: str | None) -> tuple[str, dict[str, Any], type]:
    """Convert DB URL to asyncpg format and configure connect_args/poolclass.

    - Reads DATABASE_URL, trims spaces and surrounding quotes.
    - Converts postgres:// or postgresql:// to postgresql+asyncpg://.
    - Removes unsupported query parameters (sslmode, channel_binding, options) for asyncpg.
    - For Postgres passes connect_args={"ssl": "require", "statement_cache_size": 0}.
    - Uses NullPool for serverless PostgreSQL and file SQLite; StaticPool for in-memory SQLite.
    """
    if not raw_url:
        logger.warning("DATABASE_URL is empty; database operations will be unavailable")
        return "", {}, NullPool

    url = raw_url.strip().strip("'\"").strip()
    if not url:
        return "", {}, NullPool

    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)

    connect_args: dict[str, Any] = {}
    if "asyncpg" in url:
        parsed = urllib.parse.urlsplit(url)
        q_params = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
        # asyncpg does not understand sslmode, channel_binding, or options
        filtered_q = [(k, v) for k, v in q_params if k not in ("sslmode", "channel_binding", "options")]
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
        if DATABASE_URL:
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


async def get_db():
    """FastAPI dependency that yields an async DB session."""
    try:
        session_factory = get_session_local()
    except Exception as exc:
        logger.error("DB session factory initialization error: %s: %s", exc.__class__.__name__, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        )
    if session_factory is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        )
    try:
        async with session_factory() as session:
            yield session
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("DB session error: %s: %s", exc.__class__.__name__, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        )
