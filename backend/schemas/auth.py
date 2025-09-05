
from typing import Optional
from core import models
from pydantic import BaseModel, EmailStr, constr

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str
    ts_token: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str
    ts_token: Optional[str] = None

class VerifyIn(BaseModel):
    token: str

class ResendIn(BaseModel):
    email: EmailStr

class UserOut(BaseModel):
    id: str  # keep string for UUID/int compatibility
    email: EmailStr
    name: str

class MeOut(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str]
    is_verified: bool
    timezone: Optional[str]
    avatar_url: Optional[str]

    @classmethod
    def from_user(cls, u: models.User):
        return cls(
            id=str(u.id),
            email=u.email,
            name=u.name,
            is_verified=u.is_verified,
            timezone=u.timezone,
            avatar_url=u.avatar_url,
        )

class MeUpdate(BaseModel):
    name: Optional[str] = None
    timezone: Optional[str] = None
    avatar_url: Optional[str] = None



class ForgotPasswordIn(BaseModel):
    email: EmailStr

class ResetPasswordIn(BaseModel):
    token: str
    new_password: constr(min_length=8)