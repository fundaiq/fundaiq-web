# backend/routers/auth.py

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from core.db import get_db
from core.models import User, RefreshToken
from core import security, models
from core.human import verify_turnstile
from core.config import settings

from deps.auth_deps import get_current_user
from schemas.auth import (
    RegisterIn,
    LoginIn,
    VerifyIn,
    ResendIn,
    UserOut,
    MeOut,
    MeUpdate,
    ForgotPasswordIn,
    ResetPasswordIn,
)
from services.mailer import (
    send_verification_email,
    build_verification_url,
    send_password_reset_email,
    build_password_reset_url,
)

# NEW cookie helpers (HttpOnly refresh + logged_in marker)
from services.auth_cookies import (
    create_access,              # optional (JWT access if you want it here)
    set_session_cookies,
    clear_session_cookies,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# -----------------------------
# Registration & Email Verify
# -----------------------------
@router.post("/register")
async def register(payload: RegisterIn, request: Request, db: Session = Depends(get_db)):
    # 1) Human verification (non‑blocking in dev)
    try:
        ok = await verify_turnstile(payload.ts_token, request.client.host if request.client else None)
        if not ok:
            raise HTTPException(status_code=400, detail="Human verification failed")
    except Exception:
        pass

    # 2) Unique email
    exists = db.query(User).filter(User.email == payload.email.lower()).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 3) Create user
    user = User(
        email=payload.email.lower(),
        name=payload.name.strip(),
        password_hash=security.create_password_hash(payload.password),
        is_verified=False,
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 4) Send email verification (best effort)
    try:
        raw = security.create_email_verification(db, user.id, ttl_minutes=60)
        link = build_verification_url(raw)
        
        send_verification_email(user.email, link)
    except Exception as e:
        print(f"Failed to send verification email: {e}")

    return {"ok": True, "message": "Registered. Please verify your email to unlock all features."}


@router.post("/verify-email")
def verify_email(payload: VerifyIn, db: Session = Depends(get_db)):
    user = security.verify_email_token(db, payload.token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    return {"ok": True, "message": "Email verified successfully!"}


@router.post("/resend-verification")
def resend_verification(payload: ResendIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email.lower()).first()
    if not user:
        return {"ok": True, "message": "If the email exists, a verification link has been sent."}
    if user.is_verified:
        return {"ok": True, "message": "Email is already verified."}

    try:
        raw = security.create_email_verification(db, user.id, ttl_minutes=60)
        link = build_verification_url(raw)
        
        send_verification_email(user.email, link)
    except Exception as e:
        print(f"Failed to send verification email: {e}")

    return {"ok": True, "message": "Verification email sent."}


@router.get("/verify-email")
def verify_email_get(
    token: str = Query(...),
    redirect: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """
    Email verification landing. If valid, we also auto‑sign‑in by issuing a refresh token
    and setting cookies (HttpOnly refresh + readable logged_in=true).
    """
    user = security.verify_email_token(db, token)
    target_base = (redirect or settings.FRONTEND_BASE_URL).rstrip("/")

    if not user:
        return RedirectResponse(url=f"{target_base}/verify-done?status=invalid", status_code=302)

    # Create a DB-backed refresh token (same as /login) and set cookies
    refresh_token_id = str(uuid.uuid4())
    token_hash = hashlib.sha256(refresh_token_id.encode()).hexdigest()
    refresh = RefreshToken(
        id=refresh_token_id,
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        created_at=datetime.now(timezone.utc),
    )
    db.add(refresh)
    db.commit()

    after = f"{target_base}"  # land on homepage (middleware will push to /profile)

    resp = RedirectResponse(url=after, status_code=302)
    set_session_cookies(resp, refresh_token_id, remember=True)
    return resp


# -----------------------------
# Me (profile)
# -----------------------------
@router.get("/me", response_model=MeOut)
def get_me(current: models.User = Depends(get_current_user)):
    return MeOut.from_user(current)


@router.put("/me", response_model=MeOut)
def update_me(update: MeUpdate, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    if update.name is not None:
        current.name = update.name
    if update.timezone is not None:
        current.timezone = update.timezone
    if update.avatar_url is not None:
        current.avatar_url = update.avatar_url
    db.commit()
    db.refresh(current)
    return MeOut.from_user(current)


# -----------------------------
# Login / Refresh / Logout
# -----------------------------
@router.post("/login", response_model=UserOut)
async def login(payload: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    # Turnstile (non‑blocking in dev)
    try:
        ok = await verify_turnstile(payload.ts_token, request.client.host if request.client else None)
        if not ok:
            raise HTTPException(status_code=400, detail="Human verification failed")
    except Exception:
        pass

    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not security.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Clear any previous cookies
    clear_session_cookies(response)

    # Create a DB-backed refresh token (30d) and set cookies
    refresh_token_id = str(uuid.uuid4())
    token_hash = hashlib.sha256(refresh_token_id.encode()).hexdigest()
    refresh = RefreshToken(
        id=refresh_token_id,
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        created_at=datetime.now(timezone.utc),
    )
    db.add(refresh)
    db.commit()

    # Set HttpOnly refresh cookie + logged_in marker (respect remember_me)
    remember = True if getattr(payload, "remember_me", True) else False
    set_session_cookies(response, refresh_token_id, remember=remember)

    # Return lightweight user profile; FE will call /auth/refresh to get access_token
    return UserOut(id=str(user.id), email=user.email, name=user.name)


@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Returns a short-lived access token. Uses the DB-backed refresh cookie to authenticate.
    Frontend should call this silently on 401 or at app start.
    """
    print(f"🔍 [REFRESH DEBUG] ==========================================")
    print(f"🔍 [REFRESH DEBUG] Refresh endpoint called")
    print(f"🔍 [REFRESH DEBUG] All cookies: {dict(request.cookies)}")
    print(f"🔍 [REFRESH DEBUG] Refresh cookie: {request.cookies.get('refresh_token')}")
    print(f"🔍 [REFRESH DEBUG] Logged in cookie: {request.cookies.get('logged_in')}")
    print(f"🔍 [REFRESH DEBUG] Request headers: {dict(request.headers)}")
    
    user = security.get_user_from_refresh(request, db)
    print(f"🔍 [REFRESH DEBUG] User from refresh: {user}")
    
    if not user:
        print(f"🔍 [REFRESH DEBUG] No user found, clearing cookies")
        clear_session_cookies(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    # Create short-lived access token (JWT)
    access_jwt = security.create_access_token(data={"sub": str(user.id)}, expires_delta=timedelta(minutes=15))
    print(f"🔍 [REFRESH DEBUG] Access token created: {access_jwt[:20]}...")

    return {"access_token": access_jwt}

@router.post("/logout")
def logout(request: Request, response: Response):
    print(f"🔍 [LOGOUT DEBUG] ==========================================")
    print(f"🔍 [LOGOUT DEBUG] Logout endpoint called")
    print(f"🔍 [LOGOUT DEBUG] All cookies received: {dict(request.cookies)}")
    
    clear_session_cookies(response)
    
    print(f"🔍 [LOGOUT DEBUG] Cookies cleared")
    print(f"🔍 [LOGOUT DEBUG] ==========================================")
    return {"ok": True}


# -----------------------------
# Forgot / Reset Password
# -----------------------------
@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordIn, db: Session = Depends(get_db)):
    # Always 200 to avoid account enumeration
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        raw = security.create_password_reset(db, user, ttl_minutes=30)
        link = build_password_reset_url(raw)
        try:
            
            send_password_reset_email(user.email, link)
        except Exception as e:
            print(f"Failed to send reset email: {e}")
    return {"ok": True, "message": "If that email exists, we’ve sent a reset link."}


@router.get("/reset-password/start")
def reset_password_start(
    token: str = Query(...),
    redirect: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """
    Validates reset token and redirects to the frontend form with status + token.
    """
    frontend_fallback = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/reset-password"
    target = (redirect or frontend_fallback)

    pr = security.get_valid_password_reset(db, token)
    sep = "&" if "?" in target else "?"
    if not pr:
        return RedirectResponse(url=f"{target}{sep}status=invalid", status_code=302)
    # do NOT consume here—only confirm token is OK and pass it to the frontend form
    return RedirectResponse(url=f"{target}{sep}status=ok&token={token}", status_code=302)


@router.post("/reset-password/complete")
def reset_password_complete(payload: ResetPasswordIn, response: Response, db: Session = Depends(get_db)):
    user = security.consume_password_reset(db, payload.token, payload.new_password)
    if not user:
        return {"ok": False, "message": "Unable to reset password. The link may be invalid or expired."}

    # # Auto-login after reset: create refresh token + set cookies (just like /login)
    # refresh_token_id = str(uuid.uuid4())
    # token_hash = hashlib.sha256(refresh_token_id.encode()).hexdigest()
    # refresh = RefreshToken(
    #     id=refresh_token_id,
    #     user_id=user.id,
    #     token_hash=token_hash,
    #     expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    #     created_at=datetime.now(timezone.utc),
    # )
    # db.add(refresh)
    # db.commit()

    # set_session_cookies(response, refresh_token_id, remember=True)

    # Frontend will silently call /auth/refresh to get an access token
    # redirect_url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/report"
    # return {"ok": True, "message": "Password updated.", "redirect": redirect_url}
    return {
       "ok": True, 
       "message": "Password reset successfully! Please log in with your new password.",
       "redirect": f"{settings.FRONTEND_BASE_URL.rstrip('/')}/auth?message=password_reset_success"
    }
