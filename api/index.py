# api/index.py
"""Vercel Python serverless entry point."""

import sys
from pathlib import Path

# Ensure project root is in sys.path so 'app.*' imports resolve on Vercel serverless
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    from app.main import app
except Exception as exc:
    import traceback
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    _tb = traceback.format_exc()
    app = FastAPI(title="EcoTrack Startup Error")

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
    async def _handle_startup_error(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Backend initialization failed on Vercel",
                "detail": str(exc),
                "traceback": _tb.splitlines(),
            },
        )

__all__ = ["app"]
