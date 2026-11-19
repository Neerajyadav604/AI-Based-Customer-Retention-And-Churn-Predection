"""
service.py - Main Chatbot Coordinator Service.
Coordinates intent detection, RAG context retrieval, live analytics extraction,
conversation history, and LLM response generation.
"""

import re
from typing import Dict, Any, List, Optional
from chatbot.rag import search_knowledge_base
from chatbot.analytics import (
    get_live_customer_metrics,
    find_customer_details,
    get_model_diagnostics_summary,
)
from chatbot.gemini_service import query_llm_api, fallback_domain_response

# In-memory session message history: { session_or_email: [ {"role": "...", "content": "..."} ] }
CONVERSATION_HISTORY: Dict[str, List[Dict[str, str]]] = {}


def detect_intent(query: str) -> str:
    """
    Classify user query into actionable domain intent.
    """
    q = query.lower()
    if re.search(r"\b(cust|customer|account|id|demo|#)\b", q) and re.search(r"\d+", q):
        return "specific_customer_query"
    if any(k in q for k in ["how many", "count", "high risk", "at risk", "summary", "stats", "overview"]):
        return "live_metrics_query"
    if any(k in q for k in ["rfm", "recency", "frequency", "monetary"]):
        return "rfm_explanation"
    if any(k in q for k in ["retention", "playbook", "strategy", "recommend", "how to retain", "recover"]):
        return "retention_strategy"
    if any(k in q for k in ["model", "algorithm", "accuracy", "roc", "precision", "recall", "diagnostics"]):
        return "model_diagnostics"
    if any(k in q for k in ["upload", "csv", "batch", "file", "format", "import"]):
        return "csv_upload_help"
    return "general_knowledge"


def process_chat_message(
    message: str,
    user_email: Optional[str] = None,
    session_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Process a chat message from an authenticated user or public visitor.
    """
    conv_key = user_email or session_id or "anonymous_session"
    if conv_key not in CONVERSATION_HISTORY:
        CONVERSATION_HISTORY[conv_key] = []

    # 1. Intent Detection
    intent = detect_intent(message)

    # 2. RAG Knowledge Retrieval
    rag_docs = search_knowledge_base(message, top_k=2)

    # 3. Live Analytics & Data Fetching
    live_metrics = get_live_customer_metrics(user_email)
    model_diagnostics = get_model_diagnostics_summary()

    # If user asks about a specific customer number
    specific_customer = None
    customer_match = re.search(r"(?:customer|account|#|id)?\s*([a-zA-Z0-9\-_]{2,12})", message, re.IGNORECASE)
    if customer_match and intent == "specific_customer_query":
        cand = customer_match.group(1).replace("#", "").strip()
        if cand:
            specific_customer = find_customer_details(cand, user_email)

    # 4. Construct Grounded Prompt for Gemini
    rag_context_text = "\n\n".join([f"[{d['title']}]: {d['content']}" for d in rag_docs])
    analytics_text = (
        f"Live Customer Cohort Metrics:\n"
        f"- Total Customers: {live_metrics.get('total_customers', 0)}\n"
        f"- High Risk Accounts: {live_metrics.get('high_risk', 0)}\n"
        f"- Medium Risk Accounts: {live_metrics.get('medium_risk', 0)}\n"
        f"- Low Risk Accounts: {live_metrics.get('low_risk', 0)}\n"
        f"- Avg Churn Probability: {live_metrics.get('avg_churn_probability', 0)}%\n"
        f"- Model Accuracy: {model_diagnostics.get('accuracy', 0.642)}\n"
        f"- Model Recall: {model_diagnostics.get('recall', 0.748)}\n"
        f"- Model ROC-AUC: {model_diagnostics.get('roc_auc', 0.717)}\n"
    )

    full_prompt = (
        f"KNOWLEDGE CONTEXT:\n{rag_context_text}\n\n"
        f"ANALYTICS DATA:\n{analytics_text}\n\n"
    )
    if specific_customer:
        full_prompt += f"SPECIFIC CUSTOMER IN DATASET:\n{specific_customer}\n\n"

    full_prompt += f"USER QUESTION: {message}\n\nPlease provide a clear, accurate, and helpful response:"

    # 5. Invoke Multi-Provider LLM (Gemini, Groq, OpenAI) with Domain Fallback
    llm_reply = query_llm_api(full_prompt)

    if llm_reply and len(llm_reply.strip()) > 10:
        final_answer = llm_reply
    else:
        # Fallback to deterministic domain engine
        final_answer = fallback_domain_response(
            query=message,
            rag_docs=rag_docs,
            live_metrics=live_metrics,
            model_diagnostics=model_diagnostics,
            specific_customer=specific_customer,
        )

    # 6. Append to conversation history
    CONVERSATION_HISTORY[conv_key].append({"role": "user", "content": message})
    CONVERSATION_HISTORY[conv_key].append({"role": "assistant", "content": final_answer})
    if len(CONVERSATION_HISTORY[conv_key]) > 20:
        CONVERSATION_HISTORY[conv_key] = CONVERSATION_HISTORY[conv_key][-20:]

    # 7. Dynamic Suggestion Chips
    suggestions = [
        "🔍 How many customers are at high risk?",
        "📊 Explain RFM scoring",
        "💡 Recommended retention playbooks",
        "🧠 What is the ML model's accuracy?",
    ]
    if intent == "live_metrics_query":
        suggestions = [
            "💡 How should I retain high-risk accounts?",
            "📁 What CSV format is needed for new uploads?",
            "📊 Explain the RFM features behind this risk",
        ]
    elif intent == "rfm_explanation":
        suggestions = [
            "🧠 How does the ML model weigh RFM?",
            "🔍 Show high-risk customers in my cohort",
            "💡 What action should I take on high Recency?",
        ]

    return {
        "reply": final_answer,
        "intent": intent,
        "sources": [d["title"] for d in rag_docs],
        "suggestions": suggestions,
        "metrics_context": {
            "total_customers": live_metrics.get("total_customers", 0),
            "high_risk": live_metrics.get("high_risk", 0),
            "avg_probability": live_metrics.get("avg_churn_probability", 0),
        },
    }


def get_user_chat_history(user_email: Optional[str] = None, session_id: Optional[str] = None) -> List[Dict[str, str]]:
    """Retrieve chat history."""
    conv_key = user_email or session_id or "anonymous_session"
    return CONVERSATION_HISTORY.get(conv_key, [])


def clear_user_chat_history(user_email: Optional[str] = None, session_id: Optional[str] = None) -> bool:
    """Clear chat history."""
    conv_key = user_email or session_id or "anonymous_session"
    if conv_key in CONVERSATION_HISTORY:
        CONVERSATION_HISTORY[conv_key] = []
    return True
