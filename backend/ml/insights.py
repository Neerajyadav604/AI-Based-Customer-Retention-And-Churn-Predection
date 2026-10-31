# insights.py - builds the data for the Model Insights page.
# Metrics come from model_report.json (made by make_report.py);
# feature importance comes from the saved model's coefficients.
import json
from pathlib import Path
import joblib

ML_DIR = Path(__file__).parent   # the backend/ml folder

def get_insights():
    # 1. Real results exported earlier
    with open(ML_DIR / "model_report.json") as f:
        report = json.load(f)

    # 2. Coefficients of the final Logistic Regression step in the saved pipeline
    saved = joblib.load(ML_DIR / "churn_model.joblib")
    coefs = saved["pipeline"][-1].coef_[0]
    importance = [{"feature": name, "value": round(float(c), 3)}
                  for name, c in zip(saved["features"], coefs)]

    # 3. Biggest effect first (ignoring the sign)
    importance.sort(key=lambda row: abs(row["value"]), reverse=True)
    report["feature_importance"] = importance
    return report