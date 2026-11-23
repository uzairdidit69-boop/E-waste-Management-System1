from __future__ import annotations

# api/index.py
"""Vercel Python serverless entry point."""

import json
import logging
import re
import sys
import traceback
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CURRENT_DIR = Path(__file__).resolve().parent

for p in (str(PROJECT_ROOT), str(CURRENT_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

logger = logging.getLogger("ecotrack")

_import_error: str | None = None
_import_trace: str | None = None
_real_app = None

try:
    from app.main import app as _real_app
except BaseException as exc:
    _import_error = str(exc)
    _import_trace = traceback.format_exc()
    logger.critical("Failed to import app.main: %s\n%s", exc, _import_trace)


async def app(scope, receive, send):
    """ASGI application handler for Vercel serverless."""
    if scope["type"] == "lifespan":
        while True:
            message = await receive()
            if message["type"] == "lifespan.startup":
                await send({"type": "lifespan.startup.complete"})
            elif message["type"] == "lifespan.shutdown":
                await send({"type": "lifespan.shutdown.complete"})
                return

    if scope["type"] == "http":
        if _import_error is not None:
            clean_trace = re.sub(r"://[^:]+:[^@]+@", "://***:***@", _import_trace or "")
            payload = json.dumps(
                {
                    "detail": "Cold-start server initialization error",
                    "error": _import_error,
                    "traceback": clean_trace,
                    "python_version": sys.version,
                }
            ).encode("utf-8")
            await send(
                {
                    "type": "http.response.start",
                    "status": 500,
                    "headers": [
                        [b"content-type", b"application/json"],
                        [b"content-length", str(len(payload)).encode("utf-8")],
                    ],
                }
            )
            await send(
                {
                    "type": "http.response.body",
                    "body": payload,
                }
            )
            return

        # Ensure scope["path"] reflects the actual incoming request path if Vercel rewrote it to /api/index.py
        current_path = scope.get("path", "")
        if current_path in ("/api/index.py", "/api/index", "/api/index.py/"):
            headers_dict = dict(scope.get("headers", []))
            forwarded_uri = headers_dict.get(b"x-forwarded-uri", b"").decode("utf-8", errors="ignore")
            if not forwarded_uri:
                forwarded_uri = headers_dict.get(b"x-matched-path", b"").decode("utf-8", errors="ignore")
            if forwarded_uri:
                clean_path = forwarded_uri.split("?")[0]
                if clean_path:
                    scope = dict(scope)
                    scope["path"] = clean_path
                    scope["raw_path"] = clean_path.encode("utf-8")

        try:
            return await _real_app(scope, receive, send)
        except BaseException as exc:
            tb = traceback.format_exc()
            clean_tb = re.sub(r"://[^:]+:[^@]+@", "://***:***@", tb)
            logger.error("Unhandled error during serverless execution: %s\n%s", exc, clean_tb)
            payload = json.dumps(
                {
                    "detail": "Internal server error during request execution",
                    "error": str(exc),
                    "traceback": clean_tb,
                }
            ).encode("utf-8")
            await send(
                {
                    "type": "http.response.start",
                    "status": 500,
                    "headers": [
                        [b"content-type", b"application/json"],
                        [b"content-length", str(len(payload)).encode("utf-8")],
                    ],
                }
            )
            await send(
                {
                    "type": "http.response.body",
                    "body": payload,
                }
            )
            return

    if _real_app is not None:
        return await _real_app(scope, receive, send)


__all__ = ["app"]
