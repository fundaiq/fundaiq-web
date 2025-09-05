from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str | None = None

class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
