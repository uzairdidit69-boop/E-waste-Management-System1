# app/main.py
"""FastAPI application entry point for the E-Waste Management System."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, users, areas, pickup_requests

app = FastAPI(
    title="E-Waste Management System API",
    description="Backend API for managing e-waste pickup requests, collectors, and recyclers.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS – allow the Vite dev server and Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(areas.router, prefix="/api/areas", tags=["areas"])
app.include_router(pickup_requests.router, prefix="/api/pickup-requests", tags=["pickup-requests"])


@app.get("/api/health", tags=["health"])
async def health_check():
    """Health-check endpoint used by CI and monitoring."""
    return {"status": "ok"}
