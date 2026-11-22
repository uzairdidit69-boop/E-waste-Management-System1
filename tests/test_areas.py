# tests/test_areas.py
"""Tests for the /api/areas endpoints."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.users import UserRole
from tests.conftest import create_user_direct


async def _register_login(client: AsyncClient, email: str, role: str = "requester") -> str:
    await client.post("/api/auth/register", json={"email": email, "password": "Secure123", "role": role})
    resp = await client.post("/api/auth/login", json={"email": email, "password": "Secure123"})
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_list_areas_public(client: AsyncClient):
    """Anyone can list areas without authentication."""
    resp = await client.get("/api/areas")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_list_areas_pagination(client: AsyncClient, db_session: AsyncSession):
    """Verify limit and offset query parameters work."""
    _, admin_token = await create_user_direct(db_session, "admin_pag@example.com", UserRole.ADMIN)
    for i in range(5):
        await client.post(
            "/api/areas",
            json={"name": f"Paginated Area {i}"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
    resp = await client.get("/api/areas?limit=2&offset=0")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) <= 2


@pytest.mark.asyncio
async def test_create_area_admin_only(client: AsyncClient):
    """Only admins can create areas."""
    requester_token = await _register_login(client, "req_area@example.com", "requester")
    resp = await client.post(
        "/api/areas",
        json={"name": "Test City"},
        headers={"Authorization": f"Bearer {requester_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_area_as_admin(client: AsyncClient, db_session: AsyncSession):
    _, admin_token = await create_user_direct(db_session, "admin_area@example.com", UserRole.ADMIN)
    resp = await client.post(
        "/api/areas",
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


@pytest.mark.asyncio
async def test_get_area_success(client: AsyncClient, db_session: AsyncSession):
    _, admin_token = await create_user_direct(db_session, "admin_get_area@example.com", UserRole.ADMIN)
    create_resp = await client.post(
        "/api/areas",
        json={"name": "Get Area Test", "description": "Details here"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    area_id = create_resp.json()["id"]
    resp = await client.get(f"/api/areas/{area_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Get Area Test"


@pytest.mark.asyncio
async def test_delete_area_admin_only(client: AsyncClient, db_session: AsyncSession):
    _, admin_token = await create_user_direct(db_session, "admin_del_area@example.com", UserRole.ADMIN)
    req_token = await _register_login(client, "req_del_area@example.com", "requester")

    create_resp = await client.post(
        "/api/areas",
        json={"name": "Delete Area Test"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    area_id = create_resp.json()["id"]

    # Requester forbidden
    resp_req = await client.delete(
        f"/api/areas/{area_id}",
        headers={"Authorization": f"Bearer {req_token}"},
    )
    assert resp_req.status_code == 403

    # Admin success
    resp_admin = await client.delete(
        f"/api/areas/{area_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp_admin.status_code == 204

    # Verify deleted
    resp_verify = await client.get(f"/api/areas/{area_id}")
    assert resp_verify.status_code == 404
