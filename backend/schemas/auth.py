from pydantic import BaseModel, EmailStr, Field

# Data the API accepts for signup and login
class SignupInput(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)   # bcrypt allows at most 72 bytes

class LoginInput(BaseModel):
    email: EmailStr
    password: str = Field(max_length=64)
    
    
class ProfileInput(BaseModel):
    name: str = Field(min_length=2, max_length=60)

class PasswordInput(BaseModel):
    current_password: str = Field(max_length=64)
    new_password: str = Field(min_length=8, max_length=64)    