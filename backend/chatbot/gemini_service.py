"""
gemini_service.py - Multi-Provider LLM Integration (Gemini, Groq, OpenAI)
with an Intelligent Contextual Domain Engine.
Supports GEMINI_API_KEY, GROQ_API_KEY, OPENAI_API_KEY, or CHATBOT_API_KEY from .env.
"""

import os
import re
import json
import requests
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional

# Ensure backend .env is loaded
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

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
    """Call Google Gemini REST endpoint using standard requests."""
    api_key = (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
        or os.getenv("CHATBOT_API_KEY")
    )
    if not api_key:
        return None

    # Try configured model, with fast fallback to latest flash
    preferred_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
    models_to_try = [preferred_model]
    if preferred_model != "gemini-flash-latest":
        models_to_try.append("gemini-flash-latest")

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{system_instruction}\n\n{prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 800,
        }
    }

    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=5)
            if response.status_code == 200:
                data = response.json()
                candidates = data.get("candidates", [])
                if candidates:
                    content_parts = candidates[0].get("content", {}).get("parts", [])
                    if content_parts:
                        return content_parts[0].get("text", "").strip()
            elif response.status_code == 404:
                # Model name not supported on this endpoint, try next
                continue
            else:
                print(f"[GEMINI API ERROR] Model {model} status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[GEMINI API EXCEPTION] Model {model}:", e)
            # If network error (DNS/connectivity), do not delay trying other gemini endpoints
            break

    return None


def call_groq_api(prompt: str, system_instruction: str = SYSTEM_PROMPT) -> Optional[str]:
    """Call Groq Cloud OpenAI-compatible endpoint."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.4,
        "max_tokens": 800
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=5)
        if response.status_code == 200:
            data = response.json()
            choices = data.get("choices", [])
            if choices:
                return choices[0].get("message", {}).get("content", "").strip()
        else:
            print(f"[GROQ API ERROR] Status {response.status_code}: {response.text}")
    except Exception as e:
        print("[GROQ API EXCEPTION]", e)

    return None


def call_openai_api(prompt: str, system_instruction: str = SYSTEM_PROMPT) -> Optional[str]:
    """Call OpenAI endpoint."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.4,
        "max_tokens": 800
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=5)
        if response.status_code == 200:
            data = response.json()
            choices = data.get("choices", [])
            if choices:
                return choices[0].get("message", {}).get("content", "").strip()
        else:
            print(f"[OPENAI API ERROR] Status {response.status_code}: {response.text}")
    except Exception as e:
        print("[OPENAI API EXCEPTION]", e)

    return None


def query_llm_api(prompt: str, system_instruction: str = SYSTEM_PROMPT) -> Optional[str]:
    """
    Unified multi-provider caller:
    1. Primary: Google Gemini API (GEMINI_API_KEY)
    2. Fallback: OpenAI API (OPENAI_API_KEY)
    3. Additional Fallback: Groq Cloud (GROQ_API_KEY)
    """
    # 1. Primary: Google Gemini
    reply = call_gemini_api(prompt, system_instruction)
    if reply and len(reply.strip()) > 10:
        return reply

    # 2. Secondary Fallback: OpenAI
    reply = call_openai_api(prompt, system_instruction)
    if reply and len(reply.strip()) > 10:
        return reply

    # 3. Tertiary Fallback: Groq
    reply = call_groq_api(prompt, system_instruction)
    if reply and len(reply.strip()) > 10:
        return reply

    return None


def fallback_domain_response(
    query: str,
    rag_docs: List[Dict[str, Any]],
    live_metrics: Dict[str, Any],
    model_diagnostics: Dict[str, Any],
    specific_customer: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Context-aware domain reasoning engine that generates personalized, accurate answers
    when an external LLM API key is not yet configured or is temporarily offline.
    """
    q = query.lower().strip()

    # 0. Greetings & Salutations (e.g. 'hi', 'hello', 'hey', 'good morning')
    if re.match(r"^(hi|hello|hey|greetings|hola|good morning|good afternoon|good evening|sup|yo)\b", q):
        tot = live_metrics.get("total_customers", 0)
        high = live_metrics.get("high_risk", 0)
        return (
            "### Hello! I'm ChurnGuard AI ✦\n\n"
            "I'm your intelligent customer retention copilot. I'm actively monitoring your accounts "
            f"and ready to help!\n\n"
            f"• **Active Dataset Status:** `{tot}` accounts monitored (`{high}` high risk flagged).\n"
            "• **What I can do for you:**\n"
            "  1. Break down your customer churn risk distribution.\n"
            "  2. Explain RFM (Recency, Frequency, Monetary) behavioral scoring.\n"
            "  3. Recommend tailored retention playbooks to re-engage slipping accounts.\n"
            "  4. Guide CSV dataset imports and batch predictions.\n\n"
            "*How can I assist your retention workflow today?*"
        )

    # 0.1 Identity / Purpose (e.g. 'who are you', 'what do you do')
    if any(k in q for k in ["who are you", "what are you", "what can you do", "what is churnguard", "help me"]):
        return (
            "### Welcome to ChurnGuard AI ✦\n\n"
            "I am the built-in customer intelligence agent for **ChurnGuard**. "
            "My role is to replace guesswork with proactive, data-driven customer retention.\n\n"
            "**Key Capabilities:**\n"
            "• **Live Risk Audits:** Real-time metrics on customer cohorts (Low, Medium, and High risk).\n"
            "• **RFM Scoring:** Diagnosing why accounts defect based on days since last order and purchase velocity.\n"
            "• **Retention Playbooks:** Providing exact outreach sequences (VIP checks, loyalty perks, win-back discounts).\n"
            "• **Batch Intelligence:** Auditing customer CSV uploads for immediate churn scoring.\n\n"
            "Ask me anything about your dataset, a specific customer ID, or customer retention best practices!"
        )

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

    # 2. Live Cohort / High Risk / Defection Queries
    if any(k in q for k in [
        "how many", "count", "high risk", "at risk", "summary", "stats", "overview",
        "which customers", "most likely", "likely to churn", "highest churn", "top risk", "highest risk"
    ]):
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
            "and exhibit lower probability of defecting to competitors (-0.88 coefficient).\n"
            "3. **Monetary (M):** Cumulative lifetime spend. High-monetary customers require priority intervention because losing them "
            "causes disproportionate revenue impact.\n\n"
            "**Derived Behavioral Features:** Average Order Value (AOV), ordering velocity, and tenure span."
        )

    # 4. Retention Playbooks / Strategies
    if any(k in q for k in ["retention", "playbook", "strategy", "recommend", "how to retain", "recover", "win-back"]):
        return (
            "### ChurnGuard Prescriptive Retention Playbooks 💡\n\n"
            "Retention strategies should be calibrated according to customer risk tiers:\n\n"
            "**1. High-Risk Customers (>60% Churn Probability):**\n"
            "• **Immediate Outreach:** Trigger a personalized SMS/WhatsApp or phone check-in from account management within 48 hours.\n"
            "• **Direct Value Incentive:** Provide a tailored 15% discount or complimentary upgrade on their next purchase.\n"
            "• **Feedback Loop:** Ask a 1-question survey: *'How can we make your next order seamless?'*\n\n"
            "**2. Medium-Risk Customers (40–60% Churn Probability):**\n"
            "• **Educational Re-engagement:** Send product recommendation carousels based on their previous category purchases.\n"
            "• **Nudge Notification:** Remind them of unspent loyalty points or exclusive member benefits.\n\n"
            "**3. Low-Risk Customers (<40% Churn Probability):**\n"
            "• **Loyalty Programs:** Invite them to your referral program or VIP tier.\n"
            "• **Social Proof:** Encourage reviews or community participation."
        )

    # 5. Model Architecture & Diagnostics
    if any(k in q for k in ["model", "algorithm", "accuracy", "roc", "precision", "recall", "diagnostics", "machine learning"]):
        acc = round(model_diagnostics.get("accuracy", 0.642) * 100, 1)
        rec = round(model_diagnostics.get("recall", 0.748) * 100, 1)
        roc = round(model_diagnostics.get("roc_auc", 0.717), 3)
        return (
            f"### ChurnGuard Machine Learning Diagnostics 🧠\n\n"
            f"ChurnGuard utilizes an ensemble of **XGBoost** and **Random Forest** classification models:\n\n"
            f"- **Validation Accuracy:** `{acc}%`\n"
            f"- **High-Risk Recall:** `{rec}%` (tuned to minimize false negatives so at-risk customers are not missed)\n"
            f"- **ROC-AUC Score:** `{roc}`\n"
            f"- **Decision Threshold:** `0.50` probability cutoff with calibrated risk bands:\n"
            f"  • Low Risk: `< 40%`\n"
            f"  • Medium Risk: `40% – 60%`\n"
            f"  • High Risk: `> 60%`\n\n"
            f"Top predictive drivers include **Recency days**, **Frequency count**, and **Average Order Value (AOV)**."
        )

    # 6. CSV Batch Upload Format
    if any(k in q for k in ["upload", "csv", "batch", "file", "format", "import", "columns"]):
        return (
            "### CSV Batch Upload Format Specifications 📁\n\n"
            "To upload transactions or customer profiles for batch scoring, format your CSV file with:\n\n"
            "**Required Columns:**\n"
            "• `CustomerID`: Unique alphanumeric account identifier (e.g., `12345` or `CUST-001`)\n"
            "• `InvoiceDate` / `OrderDate`: Date of transaction (`YYYY-MM-DD` or `YYYY-MM-DD HH:MM:SS`)\n"
            "• `TotalAmount` / `Spend`: Purchase amount in currency units\n"
            "• `Quantity`: Number of items in each order\n\n"
            "**Supported File Types:** `.csv` or `.xlsx` (up to 100MB).\n"
            "Once uploaded, ChurnGuard computes RFM behavioral metrics and scores churn probability for every account automatically!"
        )

    # 7. Pricing & Subscription Plans
    if any(k in q for k in ["pricing", "cost", "plan", "subscription", "price", "pro", "business"]):
        return (
            "### ChurnGuard Subscription Plans ✦\n\n"
            "• **Free Trial:** 5 single customer predictions and 1 batch upload (up to 50 rows) to test the platform.\n"
            "• **Pro Plan (₹1,999/mo):** Unlimited predictions, batch CSV uploads up to 10,000 customers, RFM segmentation, and exportable retention playbooks.\n"
            "• **Business Plan (₹4,999/mo):** Enterprise volume, dedicated API integration, custom ML retraining, and automated email/webhook triggers.\n\n"
            "Visit the **Pricing** tab in the navigation bar to upgrade seamlessly with Razorpay!"
        )

    # 8. Dynamic Grounded Fallback from retrieved RAG documents
    if rag_docs and len(rag_docs) > 0:
        top_doc = rag_docs[0]
        return (
            f"### {top_doc.get('title', 'ChurnGuard Retention Insights')} ✦\n\n"
            f"{top_doc.get('content')}\n\n"
            f"*Tip: Configure `GEMINI_API_KEY` or `GROQ_API_KEY` in your `.env` file to enable open-ended generative chat!*"
        )

    return (
        "### ChurnGuard AI Intelligence ✦\n\n"
        "I can help you monitor customer retention, understand RFM behavioral scoring, or audit your dataset.\n\n"
        "**Try asking:**\n"
        "• *'How many customers are at high risk?'*\n"
        "• *'Explain RFM scoring methodology.'*\n"
        "• *'What retention strategy should I use for at-risk accounts?'*\n"
        "• *'What is the ML model's accuracy and ROC-AUC?'*\n"
        "• *'What CSV format is needed for batch predictions?'*"
    )
