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
    print(f"🔍 [COOKIE DEBUG] APP_ENV: {getattr(settings, 'APP_ENV', 'NOT_SET')}")
    print(f"🔍 [COOKIE DEBUG] BACKEND_ORIGIN: {getattr(settings, 'BACKEND_ORIGIN', 'NOT_SET')}")
    
    if settings.APP_ENV.lower() == "dev":
        if any(str(settings.BACKEND_ORIGIN or "").startswith(h) for h in local_hosts):
            print(f"🔍 [COOKIE DEBUG] Using insecure cookies (dev + localhost)")
            return False
    print(f"🔍 [COOKIE DEBUG] Using secure cookies (production)")
    return True


def _base_cookie_kwargs():
    secure = _secure_cookies()
    cookie_domain = getattr(settings, 'COOKIE_DOMAIN', None)
    
    kwargs = {
        "httponly": True,
        "secure": secure,
        "samesite": "none",  # Changed from "lax" to "none" for cross-site
        "path": "/",
    }
    
    print(f"🔍 [COOKIE DEBUG] Base cookie settings:")
    print(f"🔍 [COOKIE DEBUG]   secure: {secure}")
    print(f"🔍 [COOKIE DEBUG]   samesite: none")  # Updated debug
    print(f"🔍 [COOKIE DEBUG]   path: /")
    print(f"🔍 [COOKIE DEBUG]   httponly: True")
    print(f"🔍 [COOKIE DEBUG]   COOKIE_DOMAIN from settings: {cookie_domain}")
    
    # Don't set domain for cross-site cookies
    # Remove this part:
    # if cookie_domain:
    #     kwargs["domain"] = cookie_domain
    
    return kwargs


# ---- JWT helpers ----
def _encode(payload: dict, ttl: timedelta, secret: str) -> str:
    now = datetime.utcnow()
    to_encode = {**payload, "iat": now, "exp": now + ttl}
    return jwt.encode(to_encode, secret, algorithm=settings.JWT_ALG or settings.ALGORITHM)


def create_access(sub: str, minutes: Optional[int] = None) -> str:
    """Create short-lived access token (used in Authorization header by the FE)."""
    ttl_min = minutes or (settings.ACCESS_TTL_MIN or settings.ACCESS_TOKEN_MINUTES)
    return _encode({"sub": sub, "type": "access"}, timedelta(minutes=ttl_min), settings.jwt_secret)


def create_refresh(sub: str, days: Optional[int] = None) -> str:
    """Create long-lived refresh token (stored in HttpOnly cookie)."""
    ttl_days = days or (settings.REFRESH_TTL_DAYS or settings.REFRESH_TOKEN_DAYS)
    return _encode({"sub": sub, "type": "refresh"}, timedelta(days=ttl_days), settings.refresh_secret)


# ---- Cookie setters/clearers ----
def set_session_cookies(response: Response, refresh_token: str, remember: bool = True) -> None:
    """
    Set the HttpOnly refresh cookie + a readable 'logged_in=true' marker cookie.
    If remember=False, cookies are session cookies (no max_age).
    """
    print(f"🔍 [COOKIE DEBUG] ==========================================")
    print(f"🔍 [COOKIE DEBUG] set_session_cookies called")
    print(f"🔍 [COOKIE DEBUG] refresh_token: {refresh_token[:20]}..." if refresh_token else "None")
    print(f"🔍 [COOKIE DEBUG] remember: {remember}")
    
    base = _base_cookie_kwargs()
    
    refresh_ttl_days = getattr(settings, 'REFRESH_TTL_DAYS', None) or getattr(settings, 'REFRESH_TOKEN_DAYS', 30)
    max_age_seconds = refresh_ttl_days * 24 * 3600
    
    print(f"🔍 [COOKIE DEBUG] refresh_ttl_days: {refresh_ttl_days}")
    print(f"🔍 [COOKIE DEBUG] max_age_seconds: {max_age_seconds}")

    # HttpOnly refresh cookie
    if remember:
        print(f"🔍 [COOKIE DEBUG] Setting refresh cookie with max_age")
        response.set_cookie(
            REFRESH_COOKIE,
            refresh_token,
            max_age=max_age_seconds,
            **base,
        )
        print(f"🔍 [COOKIE DEBUG] Refresh cookie set: {REFRESH_COOKIE}={refresh_token[:10]}... (max_age={max_age_seconds})")
    else:
        print(f"🔍 [COOKIE DEBUG] Setting refresh cookie as session cookie")
        response.set_cookie(REFRESH_COOKIE, refresh_token, **base)
        print(f"🔍 [COOKIE DEBUG] Refresh cookie set: {REFRESH_COOKIE}={refresh_token[:10]}... (session)")

    # Non-sensitive marker cookie (NOT HttpOnly) for fast frontend redirects
    logged_in_kwargs = {
        "secure": base["secure"],
        "samesite": "none",  # Changed from "lax" to "none"
        "path": base["path"],
        # do not set httponly so middleware can read it
    }
    
    cookie_domain = getattr(settings, 'COOKIE_DOMAIN', None)
    if cookie_domain:
        logged_in_kwargs["domain"] = cookie_domain
        print(f"🔍 [COOKIE DEBUG] logged_in cookie domain: {cookie_domain}")

    print(f"🔍 [COOKIE DEBUG] logged_in_kwargs: {logged_in_kwargs}")

    if remember:
        response.set_cookie(LOGGED_IN_COOKIE, "true", max_age=max_age_seconds, **logged_in_kwargs)
        print(f"🔍 [COOKIE DEBUG] Logged in cookie set: {LOGGED_IN_COOKIE}=true (max_age={max_age_seconds})")
    else:
        response.set_cookie(LOGGED_IN_COOKIE, "true", **logged_in_kwargs)
        print(f"🔍 [COOKIE DEBUG] Logged in cookie set: {LOGGED_IN_COOKIE}=true (session)")
    
    print(f"🔍 [COOKIE DEBUG] set_session_cookies completed")
    print(f"🔍 [COOKIE DEBUG] ==========================================")


def clear_session_cookies(response: Response) -> None:
    """Delete all auth cookies (refresh + marker + legacy access)."""
    print(f"🔍 [COOKIE DEBUG] ==========================================")
    print(f"🔍 [COOKIE DEBUG] clear_session_cookies called")
    
    # For cross-site cookies (SameSite=none), don't set domain when deleting
    response.delete_cookie(REFRESH_COOKIE, path="/", secure=True, samesite="none")
    response.delete_cookie(LOGGED_IN_COOKIE, path="/", secure=True, samesite="none")
    response.delete_cookie(ACCESS_COOKIE, path="/", secure=True, samesite="none")
    
    print(f"🔍 [COOKIE DEBUG] All cookies cleared with cross-site settings")
    print(f"🔍 [COOKIE DEBUG] ==========================================")