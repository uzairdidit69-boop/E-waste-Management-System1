# app/db.py
"""Async SQLAlchemy engine and session factory for the E-Waste Management System."""

import urllib.parse
from typing import Any
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool, StaticPool

from .config import settings


def normalize_database_url(raw_url: str) -> tuple[str, dict[str, Any], type]:
    """Convert DB URL to asyncpg format and configure connect_args/poolclass.

    - Strips unsupported query parameters (sslmode, channel_binding) for asyncpg.
    - Sets SSL to 'require' and disables statement cache for PgBouncer / Neon pooling.
    - Uses NullPool for serverless PostgreSQL and file SQLite; StaticPool for in-memory SQLite.
    """
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
            "prepared_statement_cache_size": 0,
        }

    pool_class: type = StaticPool if ":memory:" in url else NullPool
    return url, connect_args, pool_class


DATABASE_URL, connect_args, pool_class = normalize_database_url(settings.DATABASE_URL)

engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    poolclass=pool_class,
    connect_args=connect_args,
    echo=False,
)

AsyncSessionLocal: sessionmaker = sessionmaker(  # type: ignore[type-arg]
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db():
    """FastAPI dependency that yields an async DB session."""
    async with AsyncSessionLocal() as session:
        yield session
