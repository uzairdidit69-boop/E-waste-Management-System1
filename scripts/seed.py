# scripts/seed.py
"""Seed demo users, service areas, and pickup requests for local development."""

import asyncio
from datetime import datetime, timezone
from pathlib import Path
import sys

from dotenv import load_dotenv

# Ensure root in sys.path
BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

load_dotenv(BASE_DIR / ".env")

from sqlalchemy import select, delete
from app.db import AsyncSessionLocal
from app.auth import hash_password
from app.models.users import User, UserRole
from app.models.requesters import Requester
from app.models.collectors import Collector
from app.models.recyclers import Recycler
from app.models.areas import Area
from app.models.pickup_requests import PickupRequest, RequestStatus

USERS_DATA = [
    {
        "email": "admin@ecotrack.com",
        "password": "Admin123!",
        "role": UserRole.ADMIN,
    },
    {
        "email": "requester@ecotrack.com",
        "password": "Requester123!",
        "role": UserRole.REQUESTER,
    },
    {
        "email": "collector@ecotrack.com",
        "password": "Collector123!",
        "role": UserRole.COLLECTOR,
    },
    {
        "email": "recycler@ecotrack.com",
        "password": "Recycler123!",
        "role": UserRole.RECYCLER,
    },
]

AREAS_DATA = [
    {
        "name": "Downtown District",
        "description": "Central commercial & corporate offices zone",
    },
    {
        "name": "Green Valley",
        "description": "Residential neighborhoods and education center",
    },
    {
        "name": "Tech Innovation Hub",
        "description": "Hardware testing labs, startups, and IT center",
    },
]


async def seed():
    async with AsyncSessionLocal() as session:
        # Clean up legacy .local dummy entries
        await session.execute(delete(User).where(User.email.like("%@ecotrack.local")))
        await session.flush()

        created_users = {}
        for u in USERS_DATA:
            res = await session.execute(select(User).where(User.email == u["email"]))
            user = res.scalar_one_or_none()
            if not user:
                user = User(
                    email=u["email"],
                    hashed_password=hash_password(u["password"]),
                    role=u["role"],
                    is_active=True,
                )
                session.add(user)
                await session.flush()

                # Add specific profile
                if user.role == UserRole.REQUESTER:
                    session.add(Requester(user_id=user.id, phone="555-0101", address="123 Eco Way"))
                elif user.role == UserRole.COLLECTOR:
                    session.add(Collector(user_id=user.id))
                elif user.role == UserRole.RECYCLER:
                    session.add(Recycler(user_id=user.id))
                print(f"[+] Created user: {u['email']} ({u['role'].value})")
            else:
                print(f"[-] User {u['email']} already exists")
            created_users[u["role"]] = user

        # Seed areas
        created_areas = []
        for a in AREAS_DATA:
            res = await session.execute(select(Area).where(Area.name == a["name"]))
            area = res.scalar_one_or_none()
            if not area:
                area = Area(name=a["name"], description=a["description"])
                session.add(area)
                await session.flush()
                print(f"[+] Created area: {a['name']}")
            else:
                print(f"[-] Area {a['name']} already exists")
            created_areas.append(area)

        # Seed sample requests
        requester = created_users.get(UserRole.REQUESTER)
        if requester and created_areas:
            res_req = await session.execute(
                select(Requester).where(Requester.user_id == requester.id)
            )
            req_profile = res_req.scalar_one_or_none()

            if req_profile:
                res_pr = await session.execute(
                    select(PickupRequest).where(PickupRequest.requester_id == req_profile.id)
                )
                existing_requests = res_pr.scalars().all()
                if not existing_requests:
                    sample_requests = [
                        PickupRequest(
                            requester_id=req_profile.id,
                            area_id=created_areas[0].id,
                            status=RequestStatus.PENDING,
                            description="2 old desktop towers, 1 CRT monitor, 4 keyboards",
                            requested_at=datetime.now(timezone.utc),
                        ),
                        PickupRequest(
                            requester_id=req_profile.id,
                            area_id=created_areas[1].id,
                            status=RequestStatus.ACCEPTED,
                            description="15 decommissioned lithium-ion laptop batteries",
                            requested_at=datetime.now(timezone.utc),
                        ),
                        PickupRequest(
                            requester_id=req_profile.id,
                            area_id=created_areas[2].id,
                            status=RequestStatus.COMPLETED,
                            description="Server rack switches and cables batch",
                            requested_at=datetime.now(timezone.utc),
                            completed_at=datetime.now(timezone.utc),
                        ),
                    ]
                    session.add_all(sample_requests)
                    print(f"[+] Created {len(sample_requests)} sample pickup requests")

        await session.commit()
        print("\nSeed completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
