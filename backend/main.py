import io
import hashlib
import hmac
import re
import secrets
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException, Header
from pydantic import BaseModel
from schemas.customer import CustomerInput, PredictionOutput, BatchOutput
from ml.predictor import predict_churn, predict_batch, risk_level
from ml.features import build_customer_features
from ml.insights import get_insights
from db import init_db, save_upload, get_latest_stats

MAX_FILE_MB = 10

app = FastAPI(title="Churn Prediction API")
init_db()   # make sure the SQLite tables exist
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary development storage until a database is added.
users = {}
tokens = {}


class SignupInput(BaseModel):
    name: str
    email: str
    password: str


class LoginInput(BaseModel):
    email: str
    password: str


class ProfileInput(BaseModel):
    name: str


class PasswordInput(BaseModel):
    current_password: str
    new_password: str


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    hashed = hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()
    return f"{salt}${hashed}"


def password_matches(password, saved_password):
    salt, saved_hash = saved_password.split("$", 1)
    current_hash = hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()
    return hmac.compare_digest(current_hash, saved_hash)


def user_response(user):
    return {"name": user["name"], "email": user["email"]}


def valid_email(email):
    return re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) is not None


def get_authenticated_user(authorization):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Please log in first")
    token = authorization.replace("Bearer ", "", 1)
    email = tokens.get(token)
    if not email or email not in users:
        raise HTTPException(status_code=401, detail="Your login session has expired")
    return users[email]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/signup")
def signup(data: SignupInput):
    email = data.email.lower()
    if not valid_email(email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address")
    if email in users:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    users[email] = {
        "name": data.name.strip(),
        "email": email,
        "password": hash_password(data.password),
    }
    token = secrets.token_urlsafe(32)
    tokens[token] = email
    return {"access_token": token, "user": user_response(users[email])}


@app.post("/auth/login")
def login(data: LoginInput):
    email = data.email.lower()
    user = users.get(email)
    if not user or not password_matches(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = secrets.token_urlsafe(32)
    tokens[token] = email
    return {"access_token": token, "user": user_response(user)}


@app.get("/auth/me")
def current_user(authorization: str | None = Header(default=None)):
    return user_response(get_authenticated_user(authorization))


@app.put("/auth/profile")
def update_profile(data: ProfileInput, authorization: str | None = Header(default=None)):
    user = get_authenticated_user(authorization)
    name = data.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name cannot be empty")
    user["name"] = name
    return user_response(user)


@app.put("/auth/password")
def change_password(data: PasswordInput, authorization: str | None = Header(default=None)):
    user = get_authenticated_user(authorization)
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if not password_matches(data.current_password, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user["password"] = hash_password(data.new_password)
    return {"message": "Password changed successfully"}


@app.post("/predict", response_model=PredictionOutput)
def predict(customer: CustomerInput):
    return predict_churn(customer.model_dump())


# Upload a CSV of orders and get a churn prediction for every customer
@app.post("/predict/batch", response_model=BatchOutput)
async def predict_batch_csv(file: UploadFile = File(...)):
    # Basic file checks
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file")
    content = await file.read()
    if len(content) > MAX_FILE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File is larger than 10 MB")

    # Read the CSV
    try:
        orders = pd.read_csv(io.BytesIO(content))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read this file as a UTF-8 CSV")

    # Build features (raises a clear error if columns or rows are wrong)
    try:
        features = build_customer_features(orders)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Predict and label each customer, highest risk first
    features["churn_probability"] = predict_batch(features).round(3)
    features["risk_level"] = features["churn_probability"].apply(risk_level)
    features = features.sort_values("churn_probability", ascending=False)

    # Build the response
    customers = []
    for customer_id, row in features.iterrows():
        customers.append({
            "customer_id": str(customer_id),
            "recency_days": int(row["recency_days"]),
            "frequency": int(row["frequency"]),
            "monetary": round(float(row["monetary"]), 2),
            "churn_probability": float(row["churn_probability"]),
            "risk_level": row["risk_level"],
        })
    counts = features["risk_level"].value_counts()
    summary = {
        "total": len(features),
        "high": int(counts.get("High", 0)),
        "medium": int(counts.get("Medium", 0)),
        "low": int(counts.get("Low", 0)),
    }
    try:
        save_upload(summary, customers)
    except Exception as e:
        print("Could not save upload:", e)
    return {"summary": summary, "customers": customers}


@app.get("/model/insights")
def model_insights():
    return get_insights()

@app.get("/stats")
def stats():
    return get_latest_stats()