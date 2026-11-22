# tests/conftest.py
"""Pytest fixtures for async tests using an in-memory SQLite database."""

import os

# Set required environment variables BEFORE any app imports so that
# pydantic-settings (config.py) and SQLAlchemy (db.py) don't crash on startup.
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("DATABASE_URL_UNPOOLED", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-secret-key-that-is-at-least-64-chars-long-for-testing-purposes")

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db import get_db
from app.models.base import Base
from app.models.users import User, UserRole
from app.models.requesters import Requester
from app.models.collectors import Collector
from app.models.recyclers import Recycler
from app.auth import create_access_token, hash_password


# Use SQLite for tests (no external DB required)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
_TestingSessionLocal: sessionmaker = sessionmaker(  # type: ignore[type-arg]
    bind=_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    """Create all tables once per test session."""
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture()
async def db_session():
    """Yield a fresh transaction per test, rolled back after."""
    async with _TestingSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture()
async def client(db_session: AsyncSession):
    """AsyncClient bound to the FastAPI app with overridden DB dependency."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


async def create_user_direct(
    db_session: AsyncSession,
    email: str,
    role: UserRole = UserRole.REQUESTER,
    password: str = "Secure123!",
) -> tuple[User, str]:
    """Helper to directly insert a user and return (User, JWT_token)."""
    user = User(
        email=email.lower(),
        hashed_password=hash_password(password),
        role=role,
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()

    if role == UserRole.REQUESTER:
        db_session.add(Requester(user_id=user.id))
    elif role == UserRole.COLLECTOR:
        db_session.add(Collector(user_id=user.id))
    elif role == UserRole.RECYCLER:
        db_session.add(Recycler(user_id=user.id))

    await db_session.flush()
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return user, token

