# api/index.py
"""Vercel Python serverless entry point."""

import sys
import traceback
from pathlib import Path

# Ensure project root is in sys.path so 'app.*' imports resolve on Vercel serverless
PROJECT_ROOT = Path(__file__).resolve().parent.parent
CURRENT_DIR = Path(__file__).resolve().parent

for p in (str(PROJECT_ROOT), str(CURRENT_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.main import app
except Exception as exc:
    import logging
    logger = logging.getLogger("ecotrack")
    err_trace = traceback.format_exc()
    logger.error("Failed to import app.main: %s\n%s", exc, err_trace)

    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI()

    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
    async def fallback_handler(full_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Server startup error",
                "error": str(exc),
                "traceback": err_trace,
            },
        )

__all__ = ["app"]
