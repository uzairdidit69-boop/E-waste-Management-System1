# app/db.py
"""Async SQLAlchemy engine and session factory for the E-Waste Management System."""

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from .config import settings

# Convert standard PostgreSQL URL to async driver URL if needed
DATABASE_URL = settings.DATABASE_URL
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

# Only asyncpg accepts prepare_threshold
connect_args = {}
if "asyncpg" in DATABASE_URL:
    connect_args = {"prepare_threshold": None}  # disable prepared statements for Neon

# Use NullPool as per spec (Neon handles pooling at their edge)
engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args,
    echo=False,
)

# Async session factory
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
