from __future__ import annotations

# app/auth.py
"""JWT creation/verification and password hashing utilities."""

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from .config import settings

UTC = timezone.utc

# Moderate RFC 9106 recommended parameters optimized for serverless latency
_ph = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)
ALGORITHM = "HS256"


def hash_password(plain: str) -> str:
    """Return an Argon2 hash of the given plaintext password."""
    return _ph.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches the stored *hashed* password."""
    try:
        return _ph.verify(hashed, plain)
    except VerifyMismatchError:
        return False


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Encode a JWT with an expiry claim."""
    if not settings.JWT_SECRET:
        raise RuntimeError("JWT_SECRET environment variable is not configured")
    to_encode = data.copy()
    expire_minutes = settings.JWT_EXPIRE_MINUTES
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=expire_minutes))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT. Raises jwt.PyJWTError on failure."""
    return jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[ALGORITHM],
        options={"require": ["exp", "sub"]},
    )
