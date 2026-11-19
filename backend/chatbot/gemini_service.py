"""
gemini_service.py - Google Gemini LLM Integration with Fallback Domain Engine.
Connects to Gemini API when GEMINI_API_KEY is available, and provides
an intelligent deterministic fallback reasoning engine grounded in RAG & analytics.
"""

import os
import json
import requests
from typing import Dict, Any, List, Optional

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

SYSTEM_PROMPT = """You are ChurnGuard AI, the official AI intelligence assistant and mascot for the ChurnGuard platform.
Your mission is to help online retailers, businesses, and data analysts understand customer churn prediction,
RFM (Recency, Frequency, Monetary) behavioral scoring, ML diagnostics, and prescriptive customer retention playbooks.

GUIDELINES:
1. Always be polite, concise, professional, and helpful.
2. Ground all answers strictly in the provided ChurnGuard Knowledge Context and Live Customer Analytics.
3. NEVER fabricate customer metrics, prediction percentages, or account statuses. If live metrics are provided, cite them accurately.
4. Use clean Markdown formatting (bolding, bullet points, headers) for readability.
5. Provide actionable retention advice tailored to the customer's risk cohort (High, Medium, or Low).
"""


def call_gemini_api(prompt: str, system_instruction: str = SYSTEM_PROMPT) -> Optional[str]:
    """
    Call Google Gemini generateContent REST endpoint using standard requests.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or GEMINI_API_KEY
    if not api_key:
        return None

    url = f"{GEMINI_ENDPOINT}?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 800,
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=8)
        if response.status_code == 200:
            data = response.json()
            candidates = data.get("candidates", [])
            if candidates:
                content_parts = candidates[0].get("content", {}).get("parts", [])
                if content_parts:
                    return content_parts[0].get("text", "").strip()
        else:
            print(f"[GEMINI API ERROR] Status {response.status_code}: {response.text}")
    except Exception as e:
        print("[GEMINI API EXCEPTION]", e)

    return None


def fallback_domain_response(
    query: str,
    rag_docs: List[Dict[str, Any]],
    live_metrics: Dict[str, Any],
    model_diagnostics: Dict[str, Any],
    specific_customer: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Domain-grounded reasoning engine that generates comprehensive, accurate answers
    when Gemini API key is absent or offline.
    """
    q = query.lower()

    # 1. Specific Customer Query
    if specific_customer:
        cid = specific_customer.get("customer_id")
        prob = specific_customer.get("churn_probability")
        risk = specific_customer.get("risk_level", "Unknown")
        rec = specific_customer.get("recency_days", "N/A")
        freq = specific_customer.get("frequency", "N/A")
        mon = specific_customer.get("monetary", "N/A")
        
        reply = (
            f"### Customer **#{cid}** Analysis ✦\n\n"
            f"Here are the live telemetry details for account **#{cid}**:\n"
            f"- **Churn Probability:** `{prob}%`\n"
            f"- **Risk Level:** **{risk} Risk**\n"
            f"- **Recency:** `{rec}` days since last order\n"
            f"- **Order Frequency:** `{freq}` historical orders\n"
            f"- **Total Spend (Monetary):** `₹{mon}`\n\n"
        )
        if risk == "High":
            reply += (
                "**Recommended Retention Playbook:**\n"
                "• Dispatch VIP Concierge check-in via WhatsApp/phone call.\n"
                "• Offer a custom 15% reorder incentive valid for 7 days.\n"
                "• Ask what could make their next ordering experience smoother."
            )
        elif risk == "Medium":
            reply += (
                "**Recommended Nurture Playbook:**\n"
                "• Send an automated catalog re-engagement reminder.\n"
                "• Feature complementary products based on their past orders."
            )
        else:
            reply += (
                "**Recommended Action:**\n"
                "• Account is stable and active. Send a loyalty thank-you note and consider them for referral rewards."
            )
        return reply

    # 2. Live Cohort / High Risk Query
    if any(k in q for k in ["how many", "count", "high risk", "at risk", "summary", "stats", "overview"]):
        tot = live_metrics.get("total_customers", 0)
        high = live_metrics.get("high_risk", 0)
        med = live_metrics.get("medium_risk", 0)
        low = live_metrics.get("low_risk", 0)
        avg_prob = live_metrics.get("avg_churn_probability", 0)
        source = live_metrics.get("source", "cohort")
        source_label = "your latest uploaded dataset" if source == "live_user_database" else "the active reference cohort"

        reply = (
            f"### Live Customer Cohort Telemetry ✦\n\n"
            f"Based on **{source_label}**, here is the current risk distribution:\n\n"
            f"- **Total Accounts Evaluated:** `{tot}`\n"
            f"- **High Risk Accounts (>60%):** `{high}` ({round((high/tot)*100, 1) if tot > 0 else 0}%)\n"
            f"- **Medium Risk Accounts (40–60%):** `{med}` ({round((med/tot)*100, 1) if tot > 0 else 0}%)\n"
            f"- **Low Risk Accounts (<40%):** `{low}` ({round((low/tot)*100, 1) if tot > 0 else 0}%)\n"
            f"- **Average Churn Probability:** `{avg_prob}%`\n\n"
        )
        if high > 0:
            top_accounts = live_metrics.get("top_customers", [])
            if top_accounts:
                reply += "**Top High-Risk Accounts Requiring Immediate Follow-Up:**\n"
                for acc in top_accounts[:3]:
                    cid = acc.get("customer_id")
                    p = round(float(acc.get("churn_probability", 0)) * 100, 1)
                    reply += f"• Account **#{cid}**: `{p}%` churn probability (`₹{acc.get('monetary', 0)}` spend)\n"
                reply += "\n*Tip: Navigate to **Upload History** or **Retention Console** to export the action CSV.*"
        else:
            reply += "No high-risk accounts are currently flagged. All active customers have safe or moderate reordering velocity!"
        return reply

    # 3. RFM Analysis Explanation
    if any(k in q for k in ["rfm", "recency", "frequency", "monetary"]):
        return (
            "### Understanding RFM Analysis in ChurnGuard 📊\n\n"
            "**RFM** is the core behavioral modeling engine used to score customer loyalty and defection risk:\n\n"
            "1. **Recency (R):** Number of days since the customer last purchased. A sudden expansion in ordering intervals "
            "is the single highest weighted indicator of churn (+1.42 model coefficient).\n"
            "2. **Frequency (F):** Total number of repeat transactions. Customers who reorder regularly build habitual loyalty "
            "and exhibit strong negative correlation with churn.\n"
            "3. **Monetary (M):** Cumulative lifetime revenue. While spend doesn't directly cause churn, high-monetary defectors "
            "inflict disproportionate revenue damage, prioritizing them for concierge intervention.\n\n"
            "*In ChurnGuard, these metrics are normalized and combined with average order value (AOV) and customer tenure to calculate calibrated probabilities.*"
        )

    # 4. Retention Playbooks & Recommendations
    if any(k in q for k in ["retention", "playbook", "strategy", "recommend", "how to retain", "recover", "save"]):
        return (
            "### Prescriptive Retention Playbooks 💡\n\n"
            "ChurnGuard recommends calibrated interventions depending on the account's risk tier:\n\n"
            "**🔴 High-Risk Accounts (>60% Probability):**\n"
            "- **Personalized Check-In:** Direct outreach via WhatsApp or phone from store founder or relationship manager.\n"
            "- **Reactivation Incentive:** A targeted 15–20% return discount code valid for 7 days.\n"
            "- **Friction Discovery:** Prompt for 1-click feedback to uncover unresolved delivery or product issues.\n\n"
            "**🟡 Medium-Risk Accounts (40–60% Probability):**\n"
            "- **Re-engagement Reminder:** Gentle automated notification when reaching 80% of their typical reorder cycle.\n"
            "- **Product Recommendations:** Curated suggestions based on their historical purchase category.\n\n"
            "**🟢 Low-Risk Accounts (<40% Probability):**\n"
            "- **Loyalty Reward:** Reward points, early access to new collections, or thank-you message.\n"
            "- **Referral Promotion:** Offer store credits when referring a colleague or friend."
        )

    # 5. Machine Learning Model Diagnostics
    if any(k in q for k in ["model", "algorithm", "accuracy", "roc", "precision", "recall", "train", "diagnostics"]):
        acc = round(model_diagnostics.get("accuracy", 0.642) * 100, 1)
        rec = round(model_diagnostics.get("recall", 0.748) * 100, 1)
        prec = round(model_diagnostics.get("precision", 0.564) * 100, 1)
        auc = model_diagnostics.get("roc_auc", 0.717)
        thresh = model_diagnostics.get("threshold", 0.40)
        return (
            f"### ChurnGuard ML Model Intelligence 🧠\n\n"
            f"- **Algorithm:** Calibrated Logistic Regression pipeline with StandardScaler and balanced class weights (benchmarked against XGBoost & Random Forest).\n"
            f"- **Accuracy:** `{acc}%`\n"
            f"- **Recall (Churn Detection Rate):** `{rec}%` (prioritized so at-risk accounts are rarely missed)\n"
            f"- **Precision:** `{prec}%`\n"
            f"- **ROC-AUC Score:** `{auc}`\n"
            f"- **Decision Threshold:** `{thresh}`\n\n"
            "**Top Feature Drivers:**\n"
            "• **Recency Days (+1.42):** Long purchase gaps sharply increase churn propensity.\n"
            "• **Frequency (-0.86):** Frequent reorders strongly safeguard against defection.\n"
            "• **Customer Tenure (-0.51):** Established relationship longevity dampens churn risk."
        )

    # 6. CSV Upload & Ingestion Instructions
    if any(k in q for k in ["upload", "csv", "batch", "file", "format", "import"]):
        return (
            "### CSV Batch Upload Specifications 📁\n\n"
            "To evaluate an entire customer cohort at once, upload a CSV file with the following column headers:\n\n"
            "| Column Name | Type | Description |\n"
            "|---|---|---|\n"
            "| `customer_id` | String / Int | Unique customer identifier (e.g. `CUST-1001`) |\n"
            "| `order_date` | Date | Transaction timestamp (`YYYY-MM-DD` or standard date) |\n"
            "| `quantity` | Number | Units purchased in transaction |\n"
            "| `unit_price` | Number | Price per unit in currency |\n\n"
            "**Rules:**\n"
            "- Standard UTF-8 encoded `.csv` file.\n"
            "- Maximum file size: `100 MB`.\n"
            "- Upload via the **Batch Prediction** tab in your workspace."
        )

    # Default Context-Aware Synthesis
    top_doc = rag_docs[0] if rag_docs else None
    doc_summary = top_doc["content"] if top_doc else "ChurnGuard provides end-to-end customer retention prediction and RFM analytics."
    return (
        f"### ChurnGuard AI Intelligence ✦\n\n"
        f"{doc_summary}\n\n"
        "**Quick questions you can ask me:**\n"
        "• *How many customers are at high risk?*\n"
        "• *Explain RFM scoring methodology.*\n"
        "• *What retention strategy should I use for at-risk accounts?*\n"
        "• *What is the ML model's accuracy and ROC-AUC?*\n"
        "• *What CSV format is needed for batch predictions?*"
    )
