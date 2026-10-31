import io
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from schemas.customer import CustomerInput, PredictionOutput, BatchOutput
from ml.predictor import predict_churn, predict_batch, risk_level
from ml.features import build_customer_features
from ml.insights import get_insights
from db import init_db, save_upload, get_latest_stats, get_history, save_history
from auth import router as auth_router, current_user

MAX_FILE_MB = 10

app = FastAPI(title="Churn Prediction API")
init_db()   # make sure the SQLite tables exist
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictionOutput)
def predict(customer: CustomerInput):
    return predict_churn(customer.model_dump())


# Upload a CSV of orders and get a churn prediction for every customer
@app.post("/predict/batch", response_model=BatchOutput)
async def predict_batch_csv(file: UploadFile = File(...), user=Depends(current_user)):
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
        save_upload(user["email"], summary, customers)
    except Exception as e:
        print("Could not save upload:", e)
    return {"summary": summary, "customers": customers}


@app.get("/model/insights")
def model_insights():
    return get_insights()

@app.get("/stats")
def stats(user=Depends(current_user)):
    return get_latest_stats(user["email"])

@app.get("/history")
def history(user=Depends(current_user)):
    return get_history(user["email"])