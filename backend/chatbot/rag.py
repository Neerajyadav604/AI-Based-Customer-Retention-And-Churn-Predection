"""
rag.py - Knowledge Base & Retrieval Service for ChurnGuard AI.
Contains curated knowledge documents on RFM analysis, ML models,
risk classification, retention playbooks, and platform workflows.
"""

import re
from typing import List, Dict, Any

KNOWLEDGE_DOCUMENTS = [
    {
        "id": "doc_rfm_methodology",
        "title": "RFM (Recency, Frequency, Monetary) Methodology",
        "category": "methodology",
        "keywords": ["rfm", "recency", "frequency", "monetary", "behavioral", "scoring", "interval", "spend"],
        "content": (
            "RFM (Recency, Frequency, Monetary) is the behavioral framework ChurnGuard uses to assess customer engagement:\n"
            "1. Recency (R): Number of days since the customer's most recent order. Customers who have not ordered recently "
            "are significantly more likely to churn, especially when the gap exceeds their habitual reorder cycle.\n"
            "2. Frequency (F): Total number of distinct orders placed over the customer's lifetime. High frequency signifies strong habituation.\n"
            "3. Monetary (M): Total cumulative revenue spent across all orders. High-monetary customers require priority intervention "
            "because losing them represents substantial lost recurring revenue.\n"
            "4. Derived Metrics: Average Order Value (AOV = Monetary / Frequency), Tenure in days (first to last order), and Total Items purchased."
        ),
    },
    {
        "id": "doc_ml_model_architecture",
        "title": "ChurnGuard Machine Learning Model & Architecture",
        "category": "machine_learning",
        "keywords": ["model", "algorithm", "xgboost", "logistic regression", "accuracy", "roc_auc", "f1", "precision", "recall", "features"],
        "content": (
            "ChurnGuard utilizes an ensemble supervised learning pipeline optimized for churn classification:\n"
            "1. Primary Production Model: Calibrated Logistic Regression pipeline with StandardScaler and balanced class weights, "
            "benchmarked against XGBoost and Random Forest classifiers.\n"
            "2. Production Performance: Accuracy: 64.2%, Recall (Churn Detection Rate): 74.8%, Precision: 56.4%, ROC-AUC: 0.717.\n"
            "3. Decision Threshold: Calibrated at 0.40 (40% probability). A lower threshold favors recall so businesses do not miss slipping accounts.\n"
            "4. Input Features: recency_days, frequency, monetary, avg_order_value, tenure_days, total_items.\n"
            "5. Feature Importance: Recency is the strongest positive churn predictor (+1.42 coefficient), followed by low frequency "
            "and dropping order intervals. High tenure and frequent orders exhibit negative churn correlation (-0.86)."
        ),
    },
    {
        "id": "doc_risk_thresholds",
        "title": "Customer Risk Cohorts & Thresholds",
        "category": "risk_classification",
        "keywords": ["risk", "high risk", "medium risk", "low risk", "threshold", "probability", "cohort"],
        "content": (
            "ChurnGuard classifies evaluated customers into 3 risk cohorts based on output churn probability:\n"
            "1. High Risk (> 60% churn probability): Customers displaying severe drop-off symptoms. Order gap exceeds 2.5x habitual cycle. "
            "Require immediate proactive outreach and personalized recovery playbooks within 48-72 hours.\n"
            "2. Medium Risk (40% to 60% probability): Customers approaching the deadline of their expected reorder interval. Early nurture advised "
            "via automated product reminders or seasonal recommendations.\n"
            "3. Low Risk (< 40% probability): Healthy, loyal accounts ordering with consistent velocity and stable basket sizes. Ideal for loyalty perks, "
            "VIP clubs, and referral invitations."
        ),
    },
    {
        "id": "doc_retention_playbooks",
        "title": "Prescriptive Retention Strategies & Action Playbooks",
        "category": "retention",
        "keywords": ["retention", "strategy", "playbook", "action", "recommendation", "discount", "outreach", "save", "intervention"],
        "content": (
            "ChurnGuard provides customized retention strategies tailored to each customer risk profile:\n"
            "1. High Risk Retention Playbook:\n"
            "   • Personal Concierge Outreach: Direct WhatsApp or phone touchpoint from store founder or account manager.\n"
            "   • Reactivation Incentive: Targeted 15-20% comeback discount or free gift with next purchase.\n"
            "   • Feedback Investigation: Short 1-question check: 'Did anything fall short with your last order?' to resolve hidden service friction.\n"
            "2. Medium Risk Nurture Playbook:\n"
            "   • Friendly Store Reminder: Automated gentle ping when the customer reaches 80% of their historical order interval.\n"
            "   • Tailored Cross-Sell: Recommending complementary items based on their previous purchase categories.\n"
            "3. Low Risk Loyalty Playbook:\n"
            "   • Genuine Gratitude: Hand-written thank you note or loyalty points bonus.\n"
            "   • Referral Program: Encourage them to introduce friends in exchange for store credits."
        ),
    },
    {
        "id": "doc_csv_upload_specs",
        "title": "CSV Dataset Requirements & Ingestion Engine",
        "category": "data_ingestion",
        "keywords": ["csv", "upload", "dataset", "columns", "format", "batch", "file", "requirements"],
        "content": (
            "To evaluate a customer cohort via Bulk CSV inference, the file must adhere to these specifications:\n"
            "1. Required Columns:\n"
            "   • customer_id: Unique string or integer customer identifier (e.g. CUST-1001, demo-001).\n"
            "   • order_date: ISO or standard date format (YYYY-MM-DD or DD/MM/YYYY).\n"
            "   • quantity: Integer number of items purchased in that transaction.\n"
            "   • unit_price: Price per item in rupees/dollars.\n"
            "2. Formatting: Standard UTF-8 comma-separated CSV up to 100 MB.\n"
            "3. Output: Instant cohort scoring across all customers, distribution charts, CSV export, and full historical run persistence."
        ),
    },
    {
        "id": "doc_platform_features",
        "title": "ChurnGuard Platform Capabilities",
        "category": "platform",
        "keywords": ["platform", "workspace", "dashboard", "features", "single predict", "history", "insights", "pricing"],
        "content": (
            "ChurnGuard features a full suite of customer retention tools:\n"
            "1. Executive Overview Dashboard: Real-time telemetry, KPI benchmarks, historical churn trajectory vs XGBoost confidence intervals, "
            "risk breakdown doughnut chart, and at-risk customer queue.\n"
            "2. Single Customer Quick Predict: Evaluate one account instantly by entering Recency, Frequency, and Monetary spend.\n"
            "3. Batch Prediction & CSV Ingestion: Upload entire transaction sheets and score thousands of accounts in seconds.\n"
            "4. Upload Run History: Permanent database audit log of every upload run with downloadable sanitized Excel reports.\n"
            "5. Model Performance Diagnostics: Confusion matrix, ROC-AUC curve, feature importance rankings, and threshold tuning controls.\n"
            "6. Data Management Hub: Automated schema validation, data quality grading, median imputation, and schema drift tracking."
        ),
    },
]


def search_knowledge_base(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Search knowledge base using keyword frequency and token overlap.
    Returns the top_k most relevant documents.
    """
    query_tokens = set(re.findall(r"\w+", query.lower()))
    scored_docs = []

    for doc in KNOWLEDGE_DOCUMENTS:
        score = 0
        doc_tokens = set(re.findall(r"\w+", doc["content"].lower()))
        keyword_tokens = set([k.lower() for k in doc["keywords"]])

        # Token intersection score
        score += len(query_tokens.intersection(doc_tokens)) * 1.5
        score += len(query_tokens.intersection(keyword_tokens)) * 4.0

        # Exact phrase bonus
        for kw in doc["keywords"]:
            if kw in query.lower():
                score += 5.0

        if score > 0:
            scored_docs.append((score, doc))

    scored_docs.sort(key=lambda x: x[0], reverse=True)
    results = [item[1] for item in scored_docs[:top_k]]
    
    # If no match found, return top platform overview and RFM
    if not results:
        results = [KNOWLEDGE_DOCUMENTS[0], KNOWLEDGE_DOCUMENTS[1]]
    return results
