# auth.py - signup, login and "who am I" using bcrypt passwords and JWT tokens.
import os
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pymongo.errors import DuplicateKeyError
from mongo import users
from schemas.auth import LoginInput, SignupInput

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")
router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer()          # reads the "Authorization: Bearer <token>" header

def make_token(email):
    # The token holds the email and an expiry time (24 hours), signed with our secret
    expires = datetime.now(timezone.utc) + timedelta(hours=24)
    return jwt.encode({"sub": email, "exp": expires}, JWT_SECRET, algorithm="HS256")

def current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    # Used by protected endpoints: checks the token and returns the user from MongoDB
    try:
        data = jwt.decode(creds.credentials, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = users.find_one({"email": data["sub"]})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def public_user(user):
    # Never send the password hash back to the browser
    return {"name": user["name"], "email": user["email"]}

@router.post("/signup")
def signup(data: SignupInput):
    email = data.email.lower()
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt())   # salted hash
    user = {"name": data.name.strip(), "email": email,
            "password_hash": hashed, "created_at": datetime.now(timezone.utc)}
    try:
        users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="This email is already registered")
    return {"access_token": make_token(email), "user": public_user(user)}

@router.post("/login")
def login(data: LoginInput):
    email = data.email.lower()
    user = users.find_one({"email": email})
    # Same message for unknown email and wrong password, so nobody can probe for emails
    if user is None or not bcrypt.checkpw(data.password.encode(), user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": make_token(email), "user": public_user(user)}

@router.get("/me")
def me(user=Depends(current_user)):
    return public_user(user)