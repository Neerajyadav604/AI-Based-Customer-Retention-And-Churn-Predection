"""
service.py - Hybrid AI Chatbot Coordinator for ChurnGuard.
Combines:
- Layer A: ChurnGuard Knowledge Base & Modernized Intent Engine (inspired by Tensorflow-Chatbot)
- Layer B: Multi-Provider LLM API (Google Gemini primary, OpenAI fallback)
- Layer C: Live ChurnGuard Backend Telemetry & Customer Analytics
"""

import re
from typing import Dict, Any, List, Optional
from chatbot.intent_engine import intent_engine
from chatbot.rag import search_knowledge_base
from chatbot.analytics import (
    get_live_customer_metrics,
    find_customer_details,
    get_model_diagnostics_summary,
)
from chatbot.gemini_service import query_llm_api, fallback_domain_response

# In-memory session message history: { session_or_email: [ {"role": "...", "content": "..."} ] }
CONVERSATION_HISTORY: Dict[str, List[Dict[str, str]]] = {}

# Default 6 suggested questions required by specification
DEFAULT_SUGGESTIONS = [
    "Explain my churn dashboard.",
    "What is RFM analysis?",
    "Which customers are most likely to churn?",
    "Explain high-risk customers.",
    "How can I reduce customer churn?",
    "Explain the prediction model.",
]


def detect_domain_intent(query: str, session_id: str = "default") -> tuple:
    """
    Classify query using ModernIntentEngine and regex heuristics.
    """
    q = query.lower().strip()

    # 1. Check for specific customer account lookup (e.g. "Customer #12345" or "why is cust 74 high risk")
    cust_match = re.search(r"(?:customer|account|#|id)\s*([a-zA-Z0-9\-_]{2,12})", q, re.IGNORECASE)
    if cust_match and any(k in q for k in ["why", "risk", "status", "detail", "profile", "rfm", "churn"]):
        return "specific_customer_query", cust_match.group(1).replace("#", "").strip(), 0.95

    # 2. Check for live cohort & defection questions (Layer C)
    if any(k in q for k in [
        "which customers", "most likely to churn", "highest churn", "top risk",
        "how many customers", "at high risk", "high risk customers", "count"
    ]):
        return "live_metrics_query", None, 0.90

    # 3. Check via ModernIntentEngine (BoW and intent catalog)
    matched = intent_engine.match_intent(query, session_id=session_id)
    if matched:
        intent_item, score = matched
        return intent_item.get("tag", "general_intent"), None, score

    return "general_knowledge", None, 0.20


# Helper type
Tuple_Intent = Any


def process_chat_message(
    message: str,
    user_email: Optional[str] = None,
    session_id: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Process user chat message across Layer A (Knowledge & Intent),
    Layer B (LLM API with Gemini & OpenAI), and Layer C (Live ChurnGuard telemetry).
    """
    sid = session_id or "anonymous_session"
    conv_key = user_email or sid
    if conv_key not in CONVERSATION_HISTORY:
        CONVERSATION_HISTORY[conv_key] = []

    # 1. Intent Recognition (Modernized Intent Engine + Context Tracking)
    intent_tag, specific_cid, intent_confidence = detect_domain_intent(message, session_id=sid)

    # 2. Layer A: RAG Knowledge Retrieval
    rag_docs = search_knowledge_base(message, top_k=2)

    # 3. Layer C: Live ChurnGuard Backend Telemetry & Customer Data
    live_metrics = get_live_customer_metrics(user_email)
    model_diagnostics = get_model_diagnostics_summary()

    specific_customer = None
    if specific_cid:
        specific_customer = find_customer_details(specific_cid, user_email)

    # 4. Layer B: Prepare Grounded Context & Query LLM (Gemini primary, OpenAI fallback)
    rag_context_text = "\n\n".join([f"[{d['title']}]: {d['content']}" for d in rag_docs])
    analytics_text = (
        f"Live Customer Cohort Metrics:\n"
        f"- Total Monitored Accounts: {live_metrics.get('total_customers', 0)}\n"
        f"- High Risk Accounts (>60% prob): {live_metrics.get('high_risk', 0)}\n"
        f"- Medium Risk Accounts (40-60% prob): {live_metrics.get('medium_risk', 0)}\n"
        f"- Low Risk Accounts (<40% prob): {live_metrics.get('low_risk', 0)}\n"
        f"- Average Cohort Churn Probability: {live_metrics.get('avg_churn_probability', 0)}%\n"
        f"- Active Model Name: {model_diagnostics.get('model_name', 'XGBoost / Random Forest')}\n"
        f"- Model Accuracy: {model_diagnostics.get('accuracy', 0.642)}\n"
        f"- Model Recall (Detection Rate): {model_diagnostics.get('recall', 0.748)}\n"
        f"- Model ROC-AUC: {model_diagnostics.get('roc_auc', 0.717)}\n"
    )

    full_prompt = (
        f"CHURNGUARD KNOWLEDGE CONTEXT:\n{rag_context_text}\n\n"
        f"LIVE PLATFORM METRICS:\n{analytics_text}\n\n"
    )
    if specific_customer:
        full_prompt += f"SPECIFIC CUSTOMER TELEMETRY:\n{specific_customer}\n\n"

    full_prompt += f"USER QUESTION: {message}\n\nPlease provide an insightful, well-structured response:"

    # Attempt LLM API (Layer B)
    llm_reply = query_llm_api(full_prompt)

    if llm_reply and len(llm_reply.strip()) > 15:
        final_answer = llm_reply
        active_layer = "Layer B: LLM API"
    else:
        # Layer A & Layer C Fallback Hierarchy:
        # If question is about live metrics or specific customer, use live data synthesis
        if intent_tag in ["live_metrics_query", "specific_customer_query"] or specific_customer:
            final_answer = fallback_domain_response(
                query=message,
                rag_docs=rag_docs,
                live_metrics=live_metrics,
                model_diagnostics=model_diagnostics,
                specific_customer=specific_customer,
            )
            active_layer = "Layer C: Live Telemetry Fallback"
        else:
            # Check if ModernIntentEngine has a direct intent response
            intent_res = intent_engine.get_response(message, session_id=sid)
            if intent_res:
                final_answer = intent_res
                active_layer = "Layer A: Knowledge Base Intent"
            else:
                final_answer = fallback_domain_response(
                    query=message,
                    rag_docs=rag_docs,
                    live_metrics=live_metrics,
                    model_diagnostics=model_diagnostics,
                    specific_customer=specific_customer,
                )
                active_layer = "Layer A: RAG Fallback"

    # 5. Maintain Conversation History
    CONVERSATION_HISTORY[conv_key].append({"role": "user", "content": message})
    CONVERSATION_HISTORY[conv_key].append({"role": "assistant", "content": final_answer})
    if len(CONVERSATION_HISTORY[conv_key]) > 20:
        CONVERSATION_HISTORY[conv_key] = CONVERSATION_HISTORY[conv_key][-20:]

    # 6. Dynamic Suggested Follow-ups
    suggestions = list(DEFAULT_SUGGESTIONS)
    if intent_tag == "live_metrics_query":
        suggestions = [
            "How can I reduce customer churn?",
            "Explain high-risk customers.",
            "What is RFM analysis?",
            "Explain the prediction model.",
        ]
    elif intent_tag in ["rfm_explanation", "rfm_context"]:
        suggestions = [
            "Which customers are most likely to churn?",
            "Explain the prediction model.",
            "How can I reduce customer churn?",
            "Explain my churn dashboard.",
        ]

    sources_list = [d["title"] for d in rag_docs]
    if specific_customer:
        sources_list.append(f"Account #{specific_customer.get('customer_id')} Database Record")
    if intent_tag == "live_metrics_query":
        sources_list.append("Live Customer Cohort Analytics")

    return {
        "reply": final_answer,
        "intent": intent_tag,
        "layer": active_layer,
        "sources": list(dict.fromkeys(sources_list)),
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
