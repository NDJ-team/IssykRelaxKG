from __future__ import annotations

from pydantic import BaseModel, EmailStr


class RegisterUserRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str | None = None


class RegisterOwnerRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str | None = None
    business_phone: str | None = None


class RegisterProviderRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str | None = None
    role_slug: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str | None = None
    avatar_url: str | None = None
    role: str = "tourist"
    is_verified: bool = False

    model_config = {"from_attributes": True}
