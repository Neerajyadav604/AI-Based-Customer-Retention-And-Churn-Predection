# auth.py - signup, login and "who am I" using bcrypt passwords and JWT tokens.
import os
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from pymongo.errors import DuplicateKeyError
from mongo import users
from email_service import EmailServiceError, send_otp_email
from schemas.auth import LoginInput, SignupInput, ProfileInput, PasswordInput, OtpInput, ResendOtpInput

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
JWT_SECRET = os.getenv("JWT_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
router = APIRouter(prefix="/auth", tags=["auth"])

OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 10
OTP_MAX_ATTEMPTS = 5
OTP_RESEND_SECONDS = 60
OTP_MAX_SENDS_PER_HOUR = 5


class GoogleLoginInput(BaseModel):
    access_token: str
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
    if user.get("email_verified", True) is False:
        raise HTTPException(status_code=401, detail="Email verification required")
    return user


def _otp_hash(email, otp):
    return hashlib.sha256(f"{email}:{otp}".encode()).hexdigest()


def _as_utc(value):
    if value and value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def _clear_otp(email):
    users.update_one(
        {"email": email},
        {"$unset": {
            "otp_hash": "",
            "otp_expires_at": "",
            "otp_attempts": "",
            "otp_last_sent_at": "",
            "otp_sends_last_hour": "",
            "otp_sends_window_started_at": "",
        }},
    )


def _send_new_otp(user, reset_hour=False):
    now = datetime.now(timezone.utc)
    last_sent = _as_utc(user.get("otp_last_sent_at"))
    if last_sent:
        elapsed = (now - last_sent).total_seconds()
        if elapsed < OTP_RESEND_SECONDS:
            return False, max(1, int(OTP_RESEND_SECONDS - elapsed))

    window_started = _as_utc(user.get("otp_sends_window_started_at"))
    sends = int(user.get("otp_sends_last_hour", 0))
    if not window_started or (now - window_started).total_seconds() >= 3600 or reset_hour:
        window_started = now
        sends = 0
    if sends >= OTP_MAX_SENDS_PER_HOUR:
        return False, max(1, int(3600 - (now - window_started).total_seconds()))

    otp = f"{secrets.randbelow(10 ** OTP_LENGTH):0{OTP_LENGTH}d}"
    users.update_one(
        {"email": user["email"]},
        {"$set": {
            "otp_hash": _otp_hash(user["email"], otp),
            "otp_expires_at": now + timedelta(minutes=OTP_EXPIRY_MINUTES),
            "otp_attempts": 0,
            "otp_last_sent_at": now,
            "otp_sends_last_hour": sends + 1,
            "otp_sends_window_started_at": window_started,
        }},
    )
    try:
        send_otp_email(user["email"], user.get("name", ""), otp)
    except EmailServiceError:
        raise HTTPException(status_code=502, detail="Could not send email. Please try again.")
    return True, 0

def public_user(user):
    # Never send the password hash back to the browser
    return {
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", ""),
        "business_name": user.get("business_name", ""),
        "business_type": user.get("business_type", ""),
        "photo_url": user.get("photo_url", ""),
        "industry": user.get("industry", ""),
        "company_size": user.get("company_size", ""),
        "country": user.get("country", "India"),
        "org_role": user.get("org_role", ""),
        "goals": user.get("goals", []),
        "data_choice": user.get("data_choice", ""),
        "customer_count": user.get("customer_count", ""),
        "role": user.get("role", "user"),
        "plan": user.get("plan", "trial"),
        "onboarding_completed": user.get("onboarding_completed", True),
        "onboarding_step": user.get("onboarding_step", 0),
        "email_verified": user.get("email_verified", True),
    }

@router.post("/signup")
def signup(data: SignupInput):
    if not data.terms_accepted:
        raise HTTPException(status_code=400, detail="You must accept the terms and conditions")
    email = data.email.lower()
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt())   # salted hash
    now = datetime.now(timezone.utc)
    user = {"name": data.name.strip(), "email": email,
            "phone": "", "business_name": "", "business_type": "", "photo_url": "",
            "plan": "trial", "trials_left": 3,
            "role": "user", "is_suspended": False, "auth_provider": "email",
            "job_role": data.job_role.strip() if data.job_role else "",
            "terms_accepted": True,
            "terms_accepted_at": datetime.now(timezone.utc),
            "onboarding_completed": False,
            "onboarding_step": 0, "email_verified": False,
            "password_hash": hashed, "created_at": now, "last_login": now}
    existing = users.find_one({"email": email})
    if existing and existing.get("email_verified", True):
        raise HTTPException(status_code=409, detail="Email already registered")
    try:
        if existing:
            users.update_one(
                {"email": email},
                {"$set": user, "$unset": {
                    "otp_hash": "", "otp_expires_at": "", "otp_attempts": "",
                    "otp_last_sent_at": "", "otp_sends_last_hour": "",
                    "otp_sends_window_started_at": "",
                }},
            )
        else:
            users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Email already registered")
    _send_new_otp(user, reset_hour=True)
    return {"needs_verification": True, "email": email}

@router.post("/login")
def login(data: LoginInput):
    email = data.email.lower()
    user = users.find_one({"email": email})
    if user and user.get("is_suspended", False):
        raise HTTPException(status_code=403, detail="Account suspended")
    if user and not user.get("password_hash"):
        raise HTTPException(status_code=400, detail="This account uses Google login. Please click Continue with Google.")
    # Same message for unknown email and wrong password, so nobody can probe for emails
    if user is None or not bcrypt.checkpw(data.password.encode(), user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("email_verified", True) is False:
        _send_new_otp(user)
        return JSONResponse(
            status_code=403,
            content={"code": "EMAIL_NOT_VERIFIED", "email": email},
        )
    users.update_one({"email": email}, {"$set": {"last_login": datetime.now(timezone.utc)}})
    return {"access_token": make_token(email), "user": public_user(user)}


@router.post("/verify-otp")
def verify_otp(data: OtpInput):
    email = data.email.lower()
    user = users.find_one({"email": email})
    if user is None or user.get("email_verified", True):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")

    now = datetime.now(timezone.utc)
    expires = _as_utc(user.get("otp_expires_at"))
    if not expires or expires < now:
        _clear_otp(email)
        raise HTTPException(status_code=400, detail="Verification code expired")

    attempts = int(user.get("otp_attempts", 0))
    if attempts >= OTP_MAX_ATTEMPTS:
        _clear_otp(email)
        raise HTTPException(status_code=429, detail="Too many incorrect attempts. Please request a new code.")

    expected = user.get("otp_hash", "")
    if not hmac.compare_digest(expected, _otp_hash(email, data.otp)):
        attempts += 1
        if attempts >= OTP_MAX_ATTEMPTS:
            _clear_otp(email)
            raise HTTPException(status_code=429, detail="Too many incorrect attempts. Please request a new code.")
        users.update_one({"email": email}, {"$set": {"otp_attempts": attempts}})
        raise HTTPException(status_code=400, detail="Invalid verification code")

    users.update_one(
        {"email": email},
        {"$set": {"email_verified": True, "last_login": now}},
    )
    _clear_otp(email)
    user["email_verified"] = True
    user["last_login"] = now
    return {"access_token": make_token(email), "user": public_user(user)}


@router.post("/resend-otp")
def resend_otp(data: ResendOtpInput):
    email = data.email.lower()
    user = users.find_one({"email": email})
    if user and user.get("email_verified", True) is False:
        sent, retry_after = _send_new_otp(user)
        if not sent:
            return JSONResponse(
                status_code=429,
                content={"message": "If this account needs verification, a new code was sent"},
                headers={"Retry-After": str(retry_after)},
            )
    return {"message": "If this account needs verification, a new code was sent"}


@router.post("/google")
def google_login(data: GoogleLoginInput):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="Google login is not configured")
    try:
        response = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {data.access_token}",
                "apikey": SUPABASE_ANON_KEY,
            },
            timeout=10,
        )
    except requests.RequestException:
        raise HTTPException(status_code=401, detail="Invalid Google login")
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google login")
    try:
        google_user = response.json()
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google login")

    metadata = google_user.get("user_metadata") or {}
    email = str(google_user.get("email") or "").lower()
    if not email:
        raise HTTPException(status_code=400, detail="Google account does not have an email address")
    name = str(metadata.get("full_name") or metadata.get("name") or google_user.get("name") or email.split("@")[0]).strip()
    photo_url = metadata.get("avatar_url") or metadata.get("picture") or ""
    now = datetime.now(timezone.utc)
    user = users.find_one({"email": email})

    if user and user.get("is_suspended", False):
        raise HTTPException(status_code=403, detail="Account suspended")
    if user is None:
        user = {
            "name": name, "email": email, "phone": "", "business_name": "",
            "business_type": "", "photo_url": photo_url, "plan": "trial",
            "trials_left": 3, "role": "user", "is_suspended": False,
            "auth_provider": "google", "password_hash": None, "job_role": "",
            "terms_accepted": True, "terms_accepted_at": now,
            "onboarding_completed": False, "onboarding_step": 0,
            "email_verified": True,
            "created_at": now, "last_login": now,
        }
        try:
            users.insert_one(user)
        except DuplicateKeyError:
            user = users.find_one({"email": email})
    else:
        update = {"last_login": now}
        if not user.get("photo_url") and photo_url:
            update["photo_url"] = photo_url
            user["photo_url"] = photo_url
        users.update_one({"email": email}, {"$set": update})
        user["last_login"] = now

    return {"access_token": make_token(email), "user": public_user(user)}

@router.get("/me")
def me(user=Depends(current_user)):
    return public_user(user)


@router.put("/profile")
def update_profile(data: ProfileInput, user=Depends(current_user)):
    # Update only fields included in this request.
    fields = data.model_dump(exclude_unset=True)
    fields["name"] = fields["name"].strip()
    for field in ("phone", "business_name", "business_type"):
        if field in fields and fields[field] is None:
            fields[field] = ""
    users.update_one({"email": user["email"]}, {"$set": fields})
    user.update(fields)
    return public_user(user)

@router.put("/password")
def change_password(data: PasswordInput, user=Depends(current_user)):
    # The user must prove they know the current password first
    if not bcrypt.checkpw(data.current_password.encode(), user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    new_hash = bcrypt.hashpw(data.new_password.encode(), bcrypt.gensalt())
    users.update_one({"email": user["email"]}, {"$set": {"password_hash": new_hash}})
    return {"message": "Password updated"}