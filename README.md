# EcoTrack – E-Waste Management System

A full-stack platform for managing electronic waste pickup requests, collectors, and recycling facilities.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Backend | FastAPI, SQLAlchemy 2 (async), Alembic |
| Database | PostgreSQL (Neon free tier) |
| Auth | JWT (PyJWT) + Argon2 password hashing |
| Deployment | Vercel (frontend + Python serverless) |

## Project Structure

```
├── app/                  # FastAPI backend
│   ├── models/           # SQLAlchemy ORM models
│   ├── routers/          # API route handlers
│   ├── schemas/          # Pydantic request/response schemas
│   ├── auth.py           # JWT + Argon2 utilities
│   ├── config.py         # Settings via pydantic-settings
│   ├── db.py             # Async engine + session factory
│   ├── deps.py           # FastAPI dependencies
│   └── main.py           # App entry point + CORS
├── api/
│   └── index.py          # Vercel Python serverless entry
├── alembic/              # Database migrations
├── src/                  # React frontend source
│   ├── App.tsx           # Main application component
│   ├── App.css           # Component styles
│   └── index.css         # Global tokens & reset
├── tests/                # Pytest async tests (SQLite)
├── .env.example          # Environment variable template
├── requirements.txt      # Python runtime dependencies
├── requirements-dev.txt  # Python dev dependencies
└── vercel.json           # Vercel deployment config
```

## Prerequisites
- Python **3.12** (as specified in .python-version)

## Getting Started

### 1. Clone & configure environment

```bash
cp .env.example .env
# Fill in DATABASE_URL, DATABASE_URL_UNPOOLED, JWT_SECRET
```

### 2. Backend

```bash
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS/Linux

pip install -r requirements.txt -r requirements-dev.txt

# Run migrations
alembic upgrade head

# (Optional) Seed demo users, areas, and requests
python scripts/seed.py

# Start dev server
uvicorn app.main:app --reload
```

API docs available at: http://localhost:8000/api/docs

### 3. Frontend

```bash
npm install
npm run dev
```

Frontend available at: http://localhost:5173

### 4. Run tests

```bash
pytest
```

Tests use an in-memory SQLite database — no external DB required.

## Demo Accounts

If you run `python scripts/seed.py`, the following demo accounts are available:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@ecotrack.com` | `Admin123!` |
| **Requester** | `requester@ecotrack.com` | `Requester123!` |
| **Collector** | `collector@ecotrack.com` | `Collector123!` |
| **Recycler** | `recycler@ecotrack.com` | `Recycler123!` |

## User Roles

| Role | Capabilities |
|---|---|
| **Requester** | Create/cancel pickup requests |
| **Collector** | Accept/complete pickup requests |
| **Recycler** | View all requests and areas |
| **Admin** | Full access + manage areas |

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/users/me` | ✓ | Current user profile |
| GET | `/api/areas/` | — | List all areas |
| POST | `/api/areas/` | Admin | Create area |
| DELETE | `/api/areas/{id}` | Admin | Delete area |
| GET | `/api/pickup-requests/` | ✓ | List requests (role-filtered) |
| POST | `/api/pickup-requests/` | Requester | Create request |
| PATCH | `/api/pickup-requests/{id}` | ✓ | Update status |
| DELETE | `/api/pickup-requests/{id}` | Admin | Hard delete |
"# E-waste-Management-System1" 
