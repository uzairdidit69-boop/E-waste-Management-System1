# tests/test_areas.py
"""Tests for the /api/areas endpoints."""

import pytest
from httpx import AsyncClient


async def _register_login(client: AsyncClient, email: str, role: str = "requester") -> str:
    await client.post("/api/auth/register", json={"email": email, "password": "Secure123", "role": role})
    resp = await client.post("/api/auth/login", json={"email": email, "password": "Secure123"})
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_list_areas_public(client: AsyncClient):
    """Anyone can list areas without authentication."""
    resp = await client.get("/api/areas/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_create_area_admin_only(client: AsyncClient):
    """Only admins can create areas."""
    requester_token = await _register_login(client, "req_area@example.com", "requester")
    resp = await client.post(
        "/api/areas/",
        json={"name": "Test City"},
        headers={"Authorization": f"Bearer {requester_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_area_as_admin(client: AsyncClient):
    admin_token = await _register_login(client, "admin_area@example.com", "admin")
    resp = await client.post(
        "/api/areas/",
        json={"name": "Green Valley", "description": "A lush area"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Green Valley"


@pytest.mark.asyncio
async def test_get_area_not_found(client: AsyncClient):
    resp = await client.get("/api/areas/99999")
    assert resp.status_code == 404
