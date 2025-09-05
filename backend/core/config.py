# backend/core/config.py

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load backend/.env locally (on Render/Prod, real env vars take precedence)
BACKEND_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = BACKEND_ROOT / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=False)


class Settings(BaseSettings):
    # ===== App / URLs =====
    APP_ENV: str = os.getenv("APP_ENV", "dev")
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    BACKEND_ORIGIN: str = os.getenv("BACKEND_ORIGIN", "http://localhost:8000")
    APP_ORIGIN: str = os.getenv("APP_ORIGIN", "http://localhost:3000")  # used in verify links
    FRONTEND_BASE_URL: str = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    BACKEND_BASE_URL: str = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")

    # ===== Database =====
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # ===== JWT / Auth (backward compatible) =====
    # Primary secret(s) — keep legacy names for compatibility
    SECRET_KEY: Optional[str] = os.getenv("SECRET_KEY")
    JWT_SECRET: Optional[str] = os.getenv("JWT_SECRET")          # legacy
    JWT_SECRET_KEY: Optional[str] = os.getenv("JWT_SECRET_KEY")  # legacy

    # Algorithms (legacy + new)
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")  # legacy name used elsewhere
    JWT_ALG: str = os.getenv("JWT_ALG", "HS256")      # new name used by refreshed auth

    # Access/Refresh lifetimes (legacy + new)
    ACCESS_TOKEN_MINUTES: int = int(os.getenv("ACCESS_TOKEN_MINUTES", 15))  # legacy
    REFRESH_TOKEN_DAYS: int = int(os.getenv("REFRESH_TOKEN_DAYS", 30))      # legacy

    ACCESS_TTL_MIN: int = int(os.getenv("ACCESS_TTL_MIN", 15))              # new
    REFRESH_TTL_DAYS: int = int(os.getenv("REFRESH_TTL_DAYS", 30))          # new

    # Separate secret for refresh tokens (recommended). Falls back to jwt_secret if unset.
    REFRESH_SECRET: Optional[str] = os.getenv("REFRESH_SECRET")

    # Cookies / CORS
    COOKIE_DOMAIN: Optional[str] = os.getenv("COOKIE_DOMAIN")  # e.g. ".yourdomain.com"

    # ===== Email (SMTP) =====
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASS: Optional[str] = os.getenv("SMTP_PASS")
    FROM_EMAIL: Optional[str] = os.getenv("FROM_EMAIL")

    # Pydantic settings
    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),          # also read backend/.env if present
        env_file_encoding="utf-8",
        extra="ignore",                  # ignore unknown keys
        case_sensitive=False,
    )

    # ---- Helpers / Accessors ----
    @property
    def jwt_secret(self) -> str:
        """
        Unified accessor for the main JWT secret, supporting legacy env names.
        """
        secret = self.SECRET_KEY or self.JWT_SECRET or self.JWT_SECRET_KEY
        if not secret:
            raise RuntimeError(
                "JWT secret missing. Set SECRET_KEY or JWT_SECRET (or JWT_SECRET_KEY) in environment."
            )
        return secret

    @property
    def refresh_secret(self) -> str:
        """
        Separate secret for refresh tokens; defaults to jwt_secret if not provided.
        """
        return self.REFRESH_SECRET or self.jwt_secret


# Singleton settings object
settings = Settings()
