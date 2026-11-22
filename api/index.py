# api/index.py
"""Vercel Python serverless entry point."""

import sys
from pathlib import Path

# Ensure project root is in sys.path so 'app.*' imports resolve on Vercel serverless
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import app

__all__ = ["app"]
