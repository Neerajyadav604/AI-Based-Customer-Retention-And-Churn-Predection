from pathlib import Path
import joblib
import pandas as pd

# Load the saved model once (path is relative to this file, so it works from anywhere)
saved = joblib.load(Path(__file__).parent / "churn_model.joblib")
pipeline = saved["pipeline"]
feature_names = saved["features"]
threshold = saved["threshold"]

# Turn a probability into a risk label
def risk_level(p):
    if p >= 0.6:
        return "High"
    if p >= 0.4:
        return "Medium"
    return "Low"

# Take a customer's numbers (a dict) and return the prediction
def predict_churn(data):
    row = dict(data)
    row["avg_order_value"] = row["monetary"] / row["frequency"]   # computed, not typed by the user
    X = pd.DataFrame([row])[feature_names]   # same column order as in training
    p = float(pipeline.predict_proba(X)[0, 1])
    return {
        "churn_probability": round(p, 3),
        "risk_level": risk_level(p),
        "likely_to_churn": p >= threshold,
    }