# tests/test_pickup_requests.py
"""Tests for the /api/pickup-requests endpoints."""

import pytest
from httpx import AsyncClient


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

async def _register_login(client: AsyncClient, email: str, role: str = "requester") -> str:
    """Register and immediately login a user; returns the JWT."""
    await client.post(
        "/api/auth/register",
        json={"email": email, "password": "Secure123!", "role": role},
    )
    resp = await client.post(
        "/api/auth/login",
        json={"email": email, "password": "Secure123!"},
    )
    return resp.json()["access_token"]


async def _create_area(client: AsyncClient, admin_token: str, name: str = "Test City") -> int:
    """Admin creates an area and returns its id."""
    resp = await client.post(
        "/api/areas/",
        json={"name": name, "description": "A test area"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


# ──────────────────────────────────────────────
# List endpoint
# ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_requests_requires_auth(client: AsyncClient):
    """Unauthenticated access to list endpoint should return 401."""
    resp = await client.get("/api/pickup-requests/")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_requester_sees_only_own_requests(client: AsyncClient):
    """A requester must only see their own requests, not others'."""
    admin_token = await _register_login(client, "pr_admin_list@example.com", "admin")
    area_id = await _create_area(client, admin_token, "PR List Area")

    req1_token = await _register_login(client, "pr_user1@example.com", "requester")
    req2_token = await _register_login(client, "pr_user2@example.com", "requester")

    # user1 creates a request
    await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id, "description": "User1 request"},
        headers={"Authorization": f"Bearer {req1_token}"},
    )

    # user2 creates a request
    await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id, "description": "User2 request"},
        headers={"Authorization": f"Bearer {req2_token}"},
    )

    resp = await client.get(
        "/api/pickup-requests/",
        headers={"Authorization": f"Bearer {req1_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    descriptions = [r["description"] for r in data]
    assert "User1 request" in descriptions
    assert "User2 request" not in descriptions


@pytest.mark.asyncio
async def test_collector_sees_all_requests(client: AsyncClient):
    """A collector should see all pickup requests."""
    admin_token = await _register_login(client, "pr_admin_coll@example.com", "admin")
    area_id = await _create_area(client, admin_token, "PR Collector Area")

    req_token = await _register_login(client, "pr_requester_coll@example.com", "requester")
    col_token = await _register_login(client, "pr_collector@example.com", "collector")

    await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id, "description": "Collector visibility test"},
        headers={"Authorization": f"Bearer {req_token}"},
    )

    resp = await client.get(
        "/api/pickup-requests/",
        headers={"Authorization": f"Bearer {col_token}"},
    )
    assert resp.status_code == 200
    descriptions = [r["description"] for r in resp.json()]
    assert "Collector visibility test" in descriptions


@pytest.mark.asyncio
async def test_recycler_sees_all_requests(client: AsyncClient):
    """A recycler should see all pickup requests."""
    admin_token = await _register_login(client, "pr_admin_rec@example.com", "admin")
    area_id = await _create_area(client, admin_token, "PR Recycler Area")

    req_token = await _register_login(client, "pr_requester_rec@example.com", "requester")
    rec_token = await _register_login(client, "pr_recycler@example.com", "recycler")

    await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id, "description": "Recycler visibility test"},
        headers={"Authorization": f"Bearer {req_token}"},
    )

    resp = await client.get(
        "/api/pickup-requests/",
        headers={"Authorization": f"Bearer {rec_token}"},
    )
    assert resp.status_code == 200
    descriptions = [r["description"] for r in resp.json()]
    assert "Recycler visibility test" in descriptions


# ──────────────────────────────────────────────
# Create endpoint
# ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_request_as_requester(client: AsyncClient):
    """Requester can create a pickup request successfully."""
    admin_token = await _register_login(client, "pr_admin_create@example.com", "admin")
    area_id = await _create_area(client, admin_token, "PR Create Area")

    req_token = await _register_login(client, "pr_create_user@example.com", "requester")

    resp = await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id, "description": "2 old laptops"},
        headers={"Authorization": f"Bearer {req_token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["description"] == "2 old laptops"
    assert data["status"] == "pending"
    assert data["area_id"] == area_id


@pytest.mark.asyncio
async def test_create_request_as_collector_forbidden(client: AsyncClient):
    """Collectors cannot create pickup requests (only requesters can)."""
    admin_token = await _register_login(client, "pr_admin_nocreate@example.com", "admin")
    area_id = await _create_area(client, admin_token, "PR NoColl Area")

    col_token = await _register_login(client, "pr_col_create@example.com", "collector")

    resp = await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id},
        headers={"Authorization": f"Bearer {col_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_request_unauthenticated(client: AsyncClient):
    """Unauthenticated users cannot create requests."""
    resp = await client.post(
        "/api/pickup-requests/",
        json={"area_id": 1},
    )
    assert resp.status_code == 401


# ──────────────────────────────────────────────
# Get single endpoint
# ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_request_not_found(client: AsyncClient):
    """Fetching a non-existent request returns 404."""
    token = await _register_login(client, "pr_notfound@example.com", "collector")
    resp = await client.get(
        "/api/pickup-requests/99999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_requester_cannot_access_others_request(client: AsyncClient):
    """A requester cannot fetch another requester's individual request."""
    admin_token = await _register_login(client, "pr_admin_access@example.com", "admin")
    area_id = await _create_area(client, admin_token, "PR Access Area")

    req1_token = await _register_login(client, "pr_access1@example.com", "requester")
    req2_token = await _register_login(client, "pr_access2@example.com", "requester")

    create_resp = await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id, "description": "Private request"},
        headers={"Authorization": f"Bearer {req1_token}"},
    )
    request_id = create_resp.json()["id"]

    resp = await client.get(
        f"/api/pickup-requests/{request_id}",
        headers={"Authorization": f"Bearer {req2_token}"},
    )
    assert resp.status_code == 403


# ──────────────────────────────────────────────
# Update (PATCH) endpoint
# ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_collector_can_accept_request(client: AsyncClient):
    """A collector can accept a pending pickup request."""
    admin_token = await _register_login(client, "pr_admin_accept@example.com", "admin")
    area_id = await _create_area(client, admin_token, "PR Accept Area")

    req_token = await _register_login(client, "pr_req_accept@example.com", "requester")
    col_token = await _register_login(client, "pr_col_accept@example.com", "collector")

    create_resp = await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id, "description": "Accept me"},
        headers={"Authorization": f"Bearer {req_token}"},
    )
    request_id = create_resp.json()["id"]

    resp = await client.patch(
        f"/api/pickup-requests/{request_id}",
        json={"status": "accepted"},
        headers={"Authorization": f"Bearer {col_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "accepted"


@pytest.mark.asyncio
async def test_collector_can_complete_request(client: AsyncClient):
    """A collector can mark an accepted request as completed."""
    admin_token = await _register_login(client, "pr_admin_complete@example.com", "admin")
    area_id = await _create_area(client, admin_token, "PR Complete Area")

    req_token = await _register_login(client, "pr_req_complete@example.com", "requester")
    col_token = await _register_login(client, "pr_col_complete@example.com", "collector")

    create_resp = await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id},
        headers={"Authorization": f"Bearer {req_token}"},
    )
    request_id = create_resp.json()["id"]

    await client.patch(
        f"/api/pickup-requests/{request_id}",
        json={"status": "accepted"},
        headers={"Authorization": f"Bearer {col_token}"},
    )

    resp = await client.patch(
        f"/api/pickup-requests/{request_id}",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {col_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_requester_can_cancel_own_request(client: AsyncClient):
    """A requester can cancel their own pending request."""
    admin_token = await _register_login(client, "pr_admin_cancel@example.com", "admin")
    area_id = await _create_area(client, admin_token, "PR Cancel Area")

    req_token = await _register_login(client, "pr_req_cancel@example.com", "requester")

    create_resp = await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id, "description": "Cancel me"},
        headers={"Authorization": f"Bearer {req_token}"},
    )
    request_id = create_resp.json()["id"]

    resp = await client.patch(
        f"/api/pickup-requests/{request_id}",
        json={"status": "cancelled"},
        headers={"Authorization": f"Bearer {req_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "cancelled"


@pytest.mark.asyncio
async def test_requester_cannot_accept_request(client: AsyncClient):
    """A requester cannot set status to 'accepted' (only collectors/admins can)."""
    admin_token = await _register_login(client, "pr_admin_noaccept@example.com", "admin")
    area_id = await _create_area(client, admin_token, "PR NoAccept Area")

    req_token = await _register_login(client, "pr_req_noaccept@example.com", "requester")

    create_resp = await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id},
        headers={"Authorization": f"Bearer {req_token}"},
    )
    request_id = create_resp.json()["id"]

    resp = await client.patch(
        f"/api/pickup-requests/{request_id}",
        json={"status": "accepted"},
        headers={"Authorization": f"Bearer {req_token}"},
    )
    assert resp.status_code == 403


# ──────────────────────────────────────────────
# Delete endpoint
# ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_can_delete_request(client: AsyncClient):
    """Admin can hard-delete a pickup request."""
    admin_token = await _register_login(client, "pr_admin_delete@example.com", "admin")
    area_id = await _create_area(client, admin_token, "PR Delete Area")

    req_token = await _register_login(client, "pr_req_delete@example.com", "requester")

    create_resp = await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id, "description": "Delete me"},
        headers={"Authorization": f"Bearer {req_token}"},
    )
    request_id = create_resp.json()["id"]

    del_resp = await client.delete(
        f"/api/pickup-requests/{request_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_resp.status_code == 204

    # Verify it's gone
    get_resp = await client.get(
        f"/api/pickup-requests/{request_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_requester_cannot_delete_request(client: AsyncClient):
    """A requester cannot hard-delete a request (admin-only)."""
    admin_token = await _register_login(client, "pr_admin_nodelete@example.com", "admin")
    area_id = await _create_area(client, admin_token, "PR NoDelete Area")

    req_token = await _register_login(client, "pr_req_nodelete@example.com", "requester")

    create_resp = await client.post(
        "/api/pickup-requests/",
        json={"area_id": area_id},
        headers={"Authorization": f"Bearer {req_token}"},
    )
    request_id = create_resp.json()["id"]

    resp = await client.delete(
        f"/api/pickup-requests/{request_id}",
        headers={"Authorization": f"Bearer {req_token}"},
    )
    assert resp.status_code == 403
