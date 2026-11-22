# app/config.py
"""Application configuration using pydantic-settings."""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    DATABASE_URL_UNPOOLED: str | None = None
    JWT_SECRET: str
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

    @field_validator("JWT_SECRET")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        if not v or v.strip() == "":
            raise ValueError("JWT_SECRET cannot be empty")
        return v


settings = Settings()
