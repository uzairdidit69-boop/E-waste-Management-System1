# tests/test_health.py
"""Tests for the /api/health and /api/health/db endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """GET /api/health returns ok status without touching the database."""
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_health_db_check(client: AsyncClient):
    """GET /api/health/db verifies database connectivity."""
    resp = await client.get("/api/health/db")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
    assert resp.json()["db"] == "connected"


@pytest.mark.asyncio
async def test_health_db_check_failure(client: AsyncClient, monkeypatch: pytest.MonkeyPatch):
    """GET /api/health/db returns 503 and {'detail': 'Database unavailable'} on error."""
    import app.main
    def _mock_get_session_local():
        raise RuntimeError("Simulated connection timeout")

    monkeypatch.setattr(app.main, "get_session_local", _mock_get_session_local)
    resp = await client.get("/api/health/db")
    assert resp.status_code == 503
    assert resp.json() == {"detail": "Database unavailable"}


