import io
import os
from time import perf_counter
from pathlib import Path
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Request
from schemas.customer import CustomerInput, PredictionOutput, BatchOutput
from ml.predictor import predict_churn, predict_batch, risk_level, threshold, model_name
from ml.features import build_customer_features
from ml.insights import get_insights
from db import (
    get_history_run,
    get_latest_predictions,
    get_history,
    get_latest_stats,
    init_db,
    save_history,
    save_orders,
    save_upload,
)
from auth import router as auth_router, current_user
from photo import router as photo_router
from plans import check_access, use_trial
from routes.payment import router as payment_router
from routes.onboarding import router as onboarding_router

load_dotenv(Path(__file__).parent / ".env")

MAX_FILE_MB = 10
frontend_url = os.getenv("FRONTEND_URL")
if not frontend_url:
    raise RuntimeError("FRONTEND_URL is not configured.")

deployment = (
    "render"
    if os.getenv("RENDER", "").lower() == "true"
    or os.getenv("RENDER_SERVICE_ID")
    else "local"
)
environment = os.getenv("APP_ENV", "development")
backend_base_url = os.getenv(
    "RENDER_EXTERNAL_URL",
    f"http://localhost:{os.getenv('PORT', '8000')}",
).rstrip("/")
print(f"[API BASE URL] {backend_base_url}", flush=True)

app = FastAPI(title="Churn Prediction API")
init_db()   # make sure the SQLite tables exist
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-API-Deployment"],
)

@app.middleware("http")
async def log_api_request(request: Request, call_next):
    started_at = perf_counter()
    response = await call_next(request)
    duration_ms = (perf_counter() - started_at) * 1000
    print(
        f"[API REQUEST] deployment={deployment} "
        f"method={request.method} path={request.url.path} "
        f"status={response.status_code} duration_ms={duration_ms:.1f}",
        flush=True,
    )
    response.headers["X-API-Deployment"] = deployment
    return response

app.include_router(auth_router)
app.include_router(photo_router)
app.include_router(payment_router)
app.include_router(onboarding_router)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "deployment": deployment,
        "environment": environment,
    }

@app.post("/predict", response_model=PredictionOutput)
def predict(customer: CustomerInput, user=Depends(current_user)):
    check_access(user, rows=1)   # 1 customer
    result = predict_churn(customer.model_dump())
    use_trial(user)              # count this trial only after success
    # Add a line to this user's history. If saving fails, the prediction is still returned.
    try:
        pct = round(result["churn_probability"] * 100, 1)
        text = f"Single customer: {pct}% churn probability ({result['risk_level']} risk)"
        save_history(
            user["email"], "single", text, threshold_used=threshold,
            model_name=model_name,
            prediction_data={
                "customer_id": "",
                **customer.model_dump(),
                "avg_order_value": round(customer.monetary / customer.frequency, 2),
                "churn_probability": result["churn_probability"],
                "risk_level": result["risk_level"],
            },
        )
    except Exception as e:
        print("Could not save history:", type(e).__name__)
    return result


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

    # Check trial / paid limits using customer count, then predict
    check_access(user, rows=len(features))
    features["churn_probability"] = predict_batch(features).round(3)
    features["risk_level"] = features["churn_probability"].apply(risk_level)
    features = features.sort_values("churn_probability", ascending=False)
    use_trial(user)   # count this trial only after success

    # Build the response
    customers = []
    for customer_id, row in features.iterrows():
        customers.append({
            "customer_id": str(customer_id),
            "recency_days": int(row["recency_days"]),
            "frequency": int(row["frequency"]),
            "monetary": round(float(row["monetary"]), 2),
            "tenure_days": float(row["tenure_days"]),
            "total_items": float(row["total_items"]),
            "avg_order_value": round(float(row["avg_order_value"]), 2),
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
        upload_id = save_upload(
            user["email"], summary, customers, file_name=file.filename,
            threshold_used=threshold, model_name=model_name,
        )
        save_orders(upload_id, user["email"], orders)
    except Exception as e:
        print("Could not save upload:", type(e).__name__)
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


@app.get("/predictions/latest")
def latest_predictions(user=Depends(current_user)):
    return get_latest_predictions(user["email"])


@app.get("/history/{run_id}/download")
def download_history(run_id: int, user=Depends(current_user)):
    from exports import build_excel
    from fastapi.responses import StreamingResponse

    run = get_history_run(user["email"], run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Prediction run not found")
    workbook = build_excel(run)
    return StreamingResponse(
        workbook,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="churnIQ_predictions_{run_id}.xlsx"',
        },
    )