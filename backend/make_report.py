# make_report.py - repeats the notebook experiment and saves the real results
# to ml/model_report.json so the Model Insights page never uses typed numbers.
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score, confusion_matrix)

FEATURES = ["recency_days", "frequency", "monetary",
            "tenure_days", "total_items", "avg_order_value"]
LABEL = "churn"      # change this if your label column has another name
THRESHOLD = 0.4      # chosen earlier using training data only

# 1. Load the customer table and check the columns exist
df = pd.read_csv("data/customer_features.csv")
missing = [c for c in FEATURES + [LABEL] if c not in df.columns]
if missing:
    raise SystemExit(f"Missing columns {missing}. Columns found: {list(df.columns)}")
X, y = df[FEATURES], df[LABEL]

# 2. Same split as the notebook: 80/20, stratified, random_state=42
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)

# 3. Same pipeline for every model: log1p -> scale -> model
def make_pipeline(model):
    return Pipeline([("log", FunctionTransformer(np.log1p)),
                     ("scale", StandardScaler()),
                     ("model", model)])

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForestClassifier(
        n_estimators=100, max_depth=8, min_samples_leaf=5, random_state=42),
    "Gradient Boosting": GradientBoostingClassifier(random_state=42),
}

# 4. Comparison table at the default 0.5 threshold
comparison = []
lr_proba = None
for name, model in models.items():
    pipe = make_pipeline(model).fit(X_train, y_train)
    proba = pipe.predict_proba(X_test)[:, 1]
    pred = (proba >= 0.5).astype(int)
    cv_auc = cross_val_score(make_pipeline(model), X_train, y_train,
                             cv=5, scoring="roc_auc").mean()
    comparison.append({
        "model": name,
        "accuracy": round(accuracy_score(y_test, pred), 3),
        "precision": round(precision_score(y_test, pred), 3),
        "recall": round(recall_score(y_test, pred), 3),
        "f1": round(f1_score(y_test, pred), 3),
        "roc_auc": round(roc_auc_score(y_test, proba), 3),
        "cv_roc_auc": round(cv_auc, 3),
    })
    if name == "Logistic Regression":
        lr_proba = proba

# 5. Headline metrics: chosen model (Logistic Regression) at threshold 0.4
pred04 = (lr_proba >= THRESHOLD).astype(int)
metrics = {
    "accuracy": round(accuracy_score(y_test, pred04), 3),
    "precision": round(precision_score(y_test, pred04), 3),
    "recall": round(recall_score(y_test, pred04), 3),
    "f1": round(f1_score(y_test, pred04), 3),
    "roc_auc": round(roc_auc_score(y_test, lr_proba), 3),
    "threshold": THRESHOLD,
}
cm = confusion_matrix(y_test, pred04).tolist()   # [[TN, FP], [FN, TP]]

# 6. Save and print so you can compare with your notebook
report = {"metrics": metrics, "confusion_matrix": cm, "models": comparison}
with open("ml/model_report.json", "w") as f:
    json.dump(report, f, indent=2)

print("Test size:", len(y_test))
print("Headline metrics at 0.4:", metrics)
print("Confusion matrix at 0.4:", cm)
for row in comparison:
    print(row)