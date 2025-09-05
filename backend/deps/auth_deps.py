# deps/auth_deps.py
from fastapi import Depends, Header, Cookie, HTTPException, status
from sqlalchemy.orm import Session
from core.db import get_db
from core import security
from core.models import User

def get_bearer_or_cookie_token(
    authorization: str | None = Header(None),
    access_token: str | None = Cookie(None),
) -> str:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization.split(" ", 1)[1]
    if access_token:
        return access_token
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

def _cast_sub_to_pk(sub: str):
    pytype = User.__table__.c.id.type.python_type  # uuid.UUID for you
    try:
        return pytype(sub)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

def get_current_user(token: str = Depends(get_bearer_or_cookie_token),
                     db: Session = Depends(get_db)):
    try:
        payload = security.decode_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    pk = _cast_sub_to_pk(sub)

    # SQLAlchemy 2.x preferred
    try:
        user = db.get(User, pk)
    except AttributeError:
        user = db.query(User).filter(User.id == pk).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
