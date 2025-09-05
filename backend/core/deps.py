from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from .db import SessionLocal
from .config import settings
from .models import User
from typing import Optional

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    print(f"DEBUG: authorization header = {authorization}")  # Debug line
    
    if not authorization:
        print("DEBUG: No authorization header")  # Debug line
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    if not authorization.startswith("Bearer "):
        print("DEBUG: Authorization header doesn't start with 'Bearer '")  # Debug line
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization format")
    
    # Extract token from "Bearer <token>"
    token = authorization.split(" ")[1]
    print(f"DEBUG: extracted token = {token[:20]}...")  # Debug line
    
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        print(f"DEBUG: decoded user_id = {user_id}")  # Debug line
    except JWTError as e:
        print(f"DEBUG: JWT decode error = {e}")  # Debug line
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = db.get(User, user_id)
    if not user:
        print("DEBUG: User not found in database")  # Debug line
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    print(f"DEBUG: Found user = {user.email}")  # Debug line
    return user