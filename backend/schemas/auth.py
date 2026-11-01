from typing import Literal
from pydantic import BaseModel, EmailStr, Field

# Data the API accepts for signup and login
class SignupInput(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)   # bcrypt allows at most 72 bytes
    job_role: str | None = Field(default=None, max_length=80)
    terms_accepted: bool = False

class LoginInput(BaseModel):
    email: EmailStr
    password: str = Field(max_length=64)

class OtpInput(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")

class ResendOtpInput(BaseModel):
    email: EmailStr
    
    
class ProfileInput(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    phone: str | None = Field(default=None, pattern=r"^\+?\d{7,15}$")
    business_name: str | None = Field(default=None, max_length=80)
    business_type: Literal["Kirana store", "Online seller", "Local vendor", "Other"] | None = None

class PasswordInput(BaseModel):
    current_password: str = Field(max_length=64)
    new_password: str = Field(min_length=8, max_length=64)    