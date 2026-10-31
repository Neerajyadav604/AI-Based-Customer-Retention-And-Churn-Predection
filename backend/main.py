from fastapi import FastAPI
from schemas.customer import CustomerInput, PredictionOutput
from ml.predictor import predict_churn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Churn Prediction API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictionOutput)
def predict(customer: CustomerInput):
    return predict_churn(customer.model_dump())