# app/config.py
"""Application configuration using pydantic-settings."""

import logging
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("ecotrack")


class Settings(BaseSettings):
    DATABASE_URL: str = ""
    DATABASE_URL_UNPOOLED: str | None = None
    JWT_SECRET: str = ""
    JWT_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    ENV: str = "development"
    ENVIRONMENT: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def is_production(self) -> bool:
        env_val = (self.ENVIRONMENT or self.ENV).lower()
        return env_val in ("production", "prod")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


try:
    settings = Settings()
    if not settings.DATABASE_URL:
        logger.error("STARTUP ERROR: DATABASE_URL environment variable is missing or empty!")
    if not settings.JWT_SECRET:
        logger.error("STARTUP ERROR: JWT_SECRET environment variable is missing or empty!")
except Exception as exc:
    logger.critical("STARTUP ERROR: Failed to instantiate Settings: %s", exc)
    settings = Settings(DATABASE_URL="", JWT_SECRET="")

