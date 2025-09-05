from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import os
import uuid
from typing import Optional
from fastapi import Request
from sqlalchemy.orm import Session
import secrets, hashlib
from core import models
from sqlalchemy.exc import IntegrityError
from core.config import settings

from models.password_reset import User, PasswordReset




# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# JWT settings
from core.config import settings
SECRET_KEY = settings.jwt_secret

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user_from_refresh(request: Request, db: Session):
    """Get user from refresh token cookie"""
    from core.models import User, RefreshToken  # Import here to avoid circular imports
    
    refresh_cookie = request.cookies.get("refresh_token")
    if not refresh_cookie:
        return None
    
    try:
        # Find refresh token in database
        refresh_token = db.query(RefreshToken).filter(RefreshToken.id == refresh_cookie).first()
        if not refresh_token or refresh_token.expires_at < datetime.now(timezone.utc):
            return None
            
        return refresh_token.user
    except Exception:
        return None

def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def create_email_verification(db: Session, user_id: int, ttl_minutes: int = 60, max_tries: int = 5) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)

    for _ in range(max_tries):
        raw = secrets.token_urlsafe(32)        # longer -> even less chance of collision
        token_hash = _hash_token(raw)

        ev = models.EmailVerification(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(ev)
        try:
            db.commit()
            return raw
        except IntegrityError:
            db.rollback()
            # token_hash likely collided; try again
            continue

    raise RuntimeError("Could not create a unique email verification token after retries.")

def verify_email_token(db: Session, raw: str) -> models.User | None:
    token_hash = _hash_token(raw)
    ev = db.query(models.EmailVerification).filter(models.EmailVerification.token_hash == token_hash).first()
    if not ev or ev.used_at is not None:
        return None
    if ev.expires_at < datetime.now(timezone.utc):
        return None

    user = db.query(models.User).filter(models.User.id == ev.user_id).first()
    if not user:
        return None

    # mark used + set verified
    ev.used_at = datetime.now(timezone.utc)
    user.is_verified = True
    db.commit()
    return user




    # core/security.py

# Try python-jose first (FastAPI default), fall back to PyJWT if needed
try:
    from jose import JWTError, jwt  # pip install python-jose[cryptography]
    _DECODE_LIB = "jose"
except Exception:  # pragma: no cover
    import jwt  # PyJWT
    from jwt import ExpiredSignatureError, InvalidTokenError
    _DECODE_LIB = "pyjwt"

ALGORITHM = getattr(settings, "JWT_ALGORITHM", "HS256")


def decode_token(token: str) -> dict:
    """
    Decode & verify a JWT. Returns payload dict or raises ValueError on failure.
    """
    try:
        if _DECODE_LIB == "jose":
            # python-jose
            payload = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=[ALGORITHM],
                options={"verify_aud": False},
            )
        else:
            # PyJWT
            payload = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=[ALGORITHM],
                options={"verify_aud": False},
            )
        return payload
    except Exception as e:
        # Optionally: log e
        raise ValueError("invalid_or_expired_token") from e

def create_password_reset(db: Session, user: User, ttl_minutes: int = 30) -> str:
    raw = secrets.token_urlsafe(48)
    pr = PasswordReset(
        token_hash=_hash_token(raw),
        user_id=user.id,  # UUID → stored as-is; model handles type
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes),
    )
    db.add(pr); db.commit()
    return raw

def get_valid_password_reset(db: Session, raw: str) -> PasswordReset | None:
    pr = db.query(PasswordReset).filter(PasswordReset.token_hash == _hash_token(raw)).first()
    if not pr or pr.used_at is not None: return None
    if pr.expires_at < datetime.now(timezone.utc): return None
    return pr

def consume_password_reset(db: Session, raw: str, new_password: str) -> User | None:
    pr = get_valid_password_reset(db, raw)
    if not pr: return None
    user = db.query(User).filter(User.id == pr.user_id).first()
    if not user: return None
    
    # ✅ FIXED: Use correct field name 'password_hash' instead of 'hashed_password'
    user.password_hash = create_password_hash(new_password)
    pr.used_at = datetime.now(timezone.utc)
    db.commit()
    return user