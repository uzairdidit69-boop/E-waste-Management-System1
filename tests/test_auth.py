# tests/test_auth.py
"""Tests for the /api/auth endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    resp = await client.post(
        "/api/auth/register",
        json={"email": "alice@example.com", "password": "Secure123", "role": "requester"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "alice@example.com"
    assert data["role"] == "requester"
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    payload = {"email": "bob@example.com", "password": "Secure123", "role": "requester"}
    await client.post("/api/auth/register", json=payload)
    resp = await client.post("/api/auth/register", json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_register_short_password(client: AsyncClient):
    resp = await client.post(
        "/api/auth/register",
        json={"email": "carol@example.com", "password": "short"},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    await client.post(
        "/api/auth/register",
        json={"email": "dave@example.com", "password": "Secure123"},
    )
    resp = await client.post(
        "/api/auth/login",
        json={"email": "dave@example.com", "password": "Secure123"},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post(
        "/api/auth/register",
        json={"email": "eve@example.com", "password": "Secure123"},
    )
    resp = await client.post(
        "/api/auth/login",
        json={"email": "eve@example.com", "password": "wrongpass"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient):
    await client.post(
        "/api/auth/register",
        json={"email": "frank@example.com", "password": "Secure123"},
    )
    login = await client.post(
        "/api/auth/login",
        json={"email": "frank@example.com", "password": "Secure123"},
    )
    token = login.json()["access_token"]
    resp = await client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "frank@example.com"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/users/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_register_collector_and_recycler(client: AsyncClient):
    col_resp = await client.post(
        "/api/auth/register",
        json={"email": "collector_reg@example.com", "password": "Secure123", "role": "collector"},
    )
    assert col_resp.status_code == 201
    assert col_resp.json()["role"] == "collector"

    rec_resp = await client.post(
        "/api/auth/register",
        json={"email": "recycler_reg@example.com", "password": "Secure123", "role": "recycler"},
    )
    assert rec_resp.status_code == 201
    assert rec_resp.json()["role"] == "recycler"
