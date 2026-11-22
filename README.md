# EcoTrack – E-Waste Management System

A full-stack platform for managing electronic waste pickup requests, collectors, and recycling facilities.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, React Router 7, Vite |
| **Backend** | FastAPI, SQLAlchemy 2 (async), Alembic |
| **Database** | PostgreSQL (Neon free tier with PgBouncer pooling) / SQLite (tests) |
| **Auth** | JWT (PyJWT) + Argon2 password hashing (`argon2-cffi`) |
| **Deployment** | Vercel (Single-origin SPA + Python Serverless Functions) |

---

## Project Structure

```
├── app/                  # FastAPI backend
│   ├── models/           # SQLAlchemy ORM models (User, Area, PickupRequest, etc.)
│   ├── routers/          # API route handlers (auth, users, areas, pickup_requests)
│   ├── schemas/          # Pydantic request/response schemas
│   ├── auth.py           # JWT + Argon2 utilities (optimized for serverless)
│   ├── config.py         # Settings via pydantic-settings
│   ├── db.py             # Async engine + session factory (NullPool, SSL, statement cache)
│   ├── deps.py           # FastAPI dependencies (auth, db session)
│   └── main.py           # App entry point, CORS & health endpoints
├── api/
│   └── index.py          # Vercel Python serverless entry (ASGI app)
├── alembic/              # Database migrations (PostgreSQL & SQLite batch mode)
│   └── versions/         # Migration versions up to performance indexes
├── src/                  # React 19 frontend source
│   ├── components/       # Layout, ProtectedRoute, Icons
│   ├── context/          # AuthContext & useAuth hook
│   ├── lib/              # Typed apiFetch wrapper
│   ├── pages/            # LoginPage, RegisterPage, Dashboard, RequestList, RequestForm, AreaManager
│   ├── types/            # TypeScript schemas mirroring Pydantic models
│   ├── App.tsx           # Router configuration
│   ├── App.css           # Component styles
│   └── index.css         # Global tokens & reset
├── tests/                # Pytest async tests (SQLite in-memory)
├── .env.example          # Environment variable template
├── requirements.txt      # Python runtime dependencies (lean serverless bundle)
├── requirements-dev.txt  # Python dev/test/migration dependencies
└── vercel.json           # Vercel deployment configuration
```

---

## Prerequisites
- Python **3.12** (as specified in `.python-version`)
- Node.js **>=20.0.0**

---

## Local Getting Started

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
python -m alembic upgrade head

# (Optional) Seed demo users, areas, and requests for local development
python scripts/seed.py

# Start dev server
uvicorn app.main:app --reload
```

API docs available at: http://localhost:8000/api/docs
Health check at: http://localhost:8000/api/health

### 3. Frontend

```bash
npm install
npm run dev
```

Frontend available at: http://localhost:5173 (proxies `/api` requests to `http://localhost:8000`)

### 4. Run tests & linting

```bash
# Backend tests & linting
pytest
ruff check app tests

# Frontend linting & build
npm run lint
npm run build
```

Tests use an in-memory SQLite database — no external database required.

---

## Demo Accounts (Local Development Only)

> [!WARNING]
> These demo credentials are created **only** when running `python scripts/seed.py` in a non-production environment (`ENV=development`). In production, `seed.py` will refuse to run.

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@ecotrack.com` | `Admin123!` |
| **Requester** | `requester@ecotrack.com` | `Requester123!` |
| **Collector** | `collector@ecotrack.com` | `Collector123!` |
| **Recycler** | `recycler@ecotrack.com` | `Recycler123!` |

---

## User Roles & Capabilities

| Role | Capabilities |
|---|---|
| **Requester** | Create pickup requests; cancel own pending/accepted requests; view own requests. |
| **Collector** | View all pending requests and assigned requests; accept pending requests; complete own accepted requests. |
| **Recycler** | Read-only access across all requests and registered service areas. |
| **Admin** | Full access: create and delete service areas; view and manage all requests; hard-delete requests. |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Lightweight liveness check (no DB call) |
| GET | `/api/health/db` | — | Database connectivity check (`SELECT 1`) |
| POST | `/api/auth/register` | — | Register user (`requester`, `collector`, `recycler`) |
| POST | `/api/auth/login` | — | Login with email & password, returns JWT |
| GET | `/api/users/me` | ✓ | Current user profile |
| GET | `/api/areas` | — | List all areas (supports pagination: `limit`, `offset`) |
| GET | `/api/areas/{id}` | — | Get single area by ID |
| POST | `/api/areas` | Admin | Create service area |
| DELETE | `/api/areas/{id}` | Admin | Delete service area |
| GET | `/api/pickup-requests` | ✓ | List requests (role-filtered, supports pagination: `limit`, `offset`) |
| GET | `/api/pickup-requests/{id}` | ✓ | Get single request (role-protected) |
| POST | `/api/pickup-requests` | Requester | Create pickup request |
| PATCH | `/api/pickup-requests/{id}` | ✓ | Update status (enforces state machine) |
| DELETE | `/api/pickup-requests/{id}` | Admin | Hard-delete pickup request |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Pooled PostgreSQL connection string (Neon PgBouncer URL) for runtime queries. |
| `DATABASE_URL_UNPOOLED` | For Migrations | Direct unpooled PostgreSQL connection string for running Alembic migrations. |
| `JWT_SECRET` | Yes | High-entropy secret key for HMAC-SHA256 JWT signing (at least 32 characters in production). |
| `JWT_EXPIRE_MINUTES` | No | Token expiration duration in minutes (default: `60`). |
| `CORS_ORIGINS` | No | Comma-separated list of allowed origins for development (e.g. `http://localhost:5173`). |
| `ENV` | Yes | Environment mode (`development` or `production`). Protects scripts and enforces security checks. |
| `VITE_API_URL` | No | Frontend API base URL. Defaults to relative `/api` on Vercel deployment. |

---

## Deployment to Vercel & Neon

EcoTrack is designed to deploy on the **Vercel Hobby (free)** plan with **Neon PostgreSQL (free tier)**.

### Step 1: Run Migrations Against Neon
Run migrations directly from your local development machine against the Neon unpooled database URL:
```bash
DATABASE_URL_UNPOOLED="postgresql://<user>:<password>@<host>.region.neon.tech/<db>?sslmode=require" python -m alembic upgrade head
```

### Step 2: Push to GitHub & Connect Vercel
1. Commit and push your code to your GitHub repository.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New Project**.
3. Import your GitHub repository.
4. Set Framework Preset to **Vite**.

### Step 3: Configure Environment Variables in Vercel
Under **Project Settings → Environment Variables**, add the following for both **Production** and **Preview**:
- `DATABASE_URL`: Your pooled Neon connection string (`-pooler` host)
- `DATABASE_URL_UNPOOLED`: Your direct Neon connection string
- `JWT_SECRET`: Random 64-character secret (`python -c "import secrets; print(secrets.token_urlsafe(64))"`)
- `JWT_EXPIRE_MINUTES`: `60`
- `ENV`: `production`

### Step 4: Verify Deployment
Once deployment finishes:
1. Test health endpoint: `https://<your-project>.vercel.app/api/health`
2. Test database health: `https://<your-project>.vercel.app/api/health/db`
3. Test OpenAPI documentation: `https://<your-project>.vercel.app/api/docs`
4. Test the frontend app: Register an account, create a request, and log in.

---

## Known Limitations

- **Vercel Serverless Cold Starts**: On the free Hobby plan, Python serverless functions spin down after inactivity. Initial cold-start requests may experience 1–2 seconds of latency.
- **Function Execution Timeout**: Free Hobby plan functions have a default 10-second maximum duration (`maxDuration: 10`). Password hashing parameters in `app/auth.py` are specifically tuned to ~40ms to stay well within this threshold.
- **Neon Free-Tier Auto-Suspend**: Neon free-tier databases suspend compute instances after 5 minutes of inactivity. When a compute instance is cold, the first query may take 1–3 seconds to awaken.
- **Token Storage Trade-off**: JWT tokens are stored in browser `localStorage` for seamless single-page application navigation. As with any client-stored token, this represents a trade-off against XSS vulnerabilities compared to HttpOnly Secure cookies.
