# backend/services/auth_cookies.py

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

from fastapi import Response
from jose import jwt

from core.config import settings


# ---- Cookie names (keep legacy names where helpful) ----
ACCESS_COOKIE = "access_token"     # legacy (we no longer set this; access stays in memory on FE)
REFRESH_COOKIE = "refresh_token"   # HttpOnly cookie
LOGGED_IN_COOKIE = "logged_in"     # readable (non-sensitive) marker for frontend middleware


# ---- Cookie security decisions ----
def _secure_cookies() -> bool:
    """
    Use Secure cookies in non-local environments.
    If you run dev over HTTPS, you can force SECURE by setting APP_ENV != 'dev'.
    """
    local_hosts = ("http://localhost", "http://127.0.0.1")
    if settings.APP_ENV.lower() == "dev":
        if any(str(settings.BACKEND_ORIGIN or "").startswith(h) for h in local_hosts):
            return False
    return True


def _base_cookie_kwargs():
    kwargs = {
        "httponly": True,             # only for refresh cookie
        "secure": _secure_cookies(),
        "samesite": "lax",
        "path": "/",
    }
    # Attach domain if provided (e.g., ".yourdomain.com") to share across subdomains
    if settings.COOKIE_DOMAIN:
        kwargs["domain"] = settings.COOKIE_DOMAIN
    return kwargs


# ---- JWT helpers ----
def _encode(payload: dict, ttl: timedelta, secret: str) -> str:
    now = datetime.utcnow()
    to_encode = {**payload, "iat": now, "exp": now + ttl}
    return jwt.encode(to_encode, secret, algorithm=settings.JWT_ALG or settings.ALGORITHM)


def create_access(sub: str, minutes: Optional[int] = None) -> str:
    """Create short‑lived access token (used in Authorization header by the FE)."""
    ttl_min = minutes or (settings.ACCESS_TTL_MIN or settings.ACCESS_TOKEN_MINUTES)
    return _encode({"sub": sub, "type": "access"}, timedelta(minutes=ttl_min), settings.jwt_secret)


def create_refresh(sub: str, days: Optional[int] = None) -> str:
    """Create long‑lived refresh token (stored in HttpOnly cookie)."""
    ttl_days = days or (settings.REFRESH_TTL_DAYS or settings.REFRESH_TOKEN_DAYS)
    return _encode({"sub": sub, "type": "refresh"}, timedelta(days=ttl_days), settings.refresh_secret)


# ---- Cookie setters/clearers ----
def set_session_cookies(response: Response, refresh_token: str, remember: bool = True) -> None:
    """
    Set the HttpOnly refresh cookie + a readable 'logged_in=true' marker cookie.
    If remember=False, cookies are session cookies (no max_age).
    """
    base = _base_cookie_kwargs()

    # HttpOnly refresh cookie
    if remember:
        response.set_cookie(
            REFRESH_COOKIE,
            refresh_token,
            max_age=(settings.REFRESH_TTL_DAYS or settings.REFRESH_TOKEN_DAYS) * 24 * 3600,
            **base,
        )
    else:
        # session cookie (no max_age)
        response.set_cookie(REFRESH_COOKIE, refresh_token, **base)

    # Non-sensitive marker cookie (NOT HttpOnly) for fast frontend redirects
    logged_in_kwargs = {
        "secure": base["secure"],
        "samesite": base["samesite"],
        "path": base["path"],
        # do not set httponly so middleware can read it
    }
    if settings.COOKIE_DOMAIN:
        logged_in_kwargs["domain"] = settings.COOKIE_DOMAIN

    if remember:
        response.set_cookie(LOGGED_IN_COOKIE, "true", max_age=(settings.REFRESH_TTL_DAYS or settings.REFRESH_TOKEN_DAYS) * 24 * 3600, **logged_in_kwargs)  # type: ignore[arg-type]
    else:
        response.set_cookie(LOGGED_IN_COOKIE, "true", **logged_in_kwargs)  # type: ignore[arg-type]


def clear_session_cookies(response: Response) -> None:
    """Delete all auth cookies (refresh + marker + legacy access)."""
    response.delete_cookie(REFRESH_COOKIE, path="/", domain=settings.COOKIE_DOMAIN or None)
    response.delete_cookie(LOGGED_IN_COOKIE, path="/", domain=settings.COOKIE_DOMAIN or None)
    # legacy access cookie (if it was used anywhere)
    response.delete_cookie(ACCESS_COOKIE, path="/", domain=settings.COOKIE_DOMAIN or None)
