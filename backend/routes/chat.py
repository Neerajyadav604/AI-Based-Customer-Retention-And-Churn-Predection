"""
routes/chat.py - Chatbot API endpoints for ChurnGuard AI.
Handles message exchange, conversation history, and suggestion chips.
Supports both authenticated users and public session visitors.
"""

import os
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
import jwt
from chatbot.service import (
    process_chat_message,
    get_user_chat_history,
    clear_user_chat_history,
)

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-prod")

router = APIRouter(prefix="/api/chat", tags=["chatbot"])


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1500)
    session_id: Optional[str] = Field(None, max_length=100)


class ChatMessageResponse(BaseModel):
    reply: str
    intent: str
    sources: List[str]
    suggestions: List[str]
    metrics_context: Dict[str, Any]


def get_optional_user_email(request: Request) -> Optional[str]:
    """
    Extract user email from Authorization header if present and valid.
    Does not raise 401 if header is absent or invalid (falls back to guest mode).
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("sub")
    except Exception:
        return None


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(req: ChatMessageRequest, request: Request):
    """
    Submit a message to ChurnGuard AI and receive an intelligent, grounded response.
    """
    user_email = get_optional_user_email(request)
    try:
        result = process_chat_message(
            message=req.message,
            user_email=user_email,
            session_id=req.session_id,
        )
        return result
    except Exception as e:
        print("[CHATBOT ERROR]", type(e).__name__, e)
        raise HTTPException(
            status_code=500,
            detail="The AI assistant is temporarily unavailable. Please try again shortly.",
        )


@router.get("/history")
async def get_history(request: Request, session_id: Optional[str] = None):
    """
    Retrieve recent conversation turns for this user/session.
    """
    user_email = get_optional_user_email(request)
    history = get_user_chat_history(user_email=user_email, session_id=session_id)
    return {"history": history}


@router.delete("/history")
async def clear_history(request: Request, session_id: Optional[str] = None):
    """
    Clear conversation turns for this user/session.
    """
    user_email = get_optional_user_email(request)
    clear_user_chat_history(user_email=user_email, session_id=session_id)
    return {"status": "cleared"}


@router.get("/suggestions")
async def get_suggestions(request: Request):
    """
    Get initial prompt suggestion chips.
    """
    user_email = get_optional_user_email(request)
    if user_email:
        return {
            "suggestions": [
                "🔍 How many customers are at high risk in my dataset?",
                "📊 Explain RFM scoring methodology",
                "💡 What retention playbook works best for high-risk accounts?",
                "🧠 What is ChurnGuard's ML model accuracy?",
            ]
        }
    return {
        "suggestions": [
            "✦ What is ChurnGuard and how does it predict churn?",
            "📊 How does RFM behavioral analysis work?",
            "💡 What retention playbooks are recommended?",
            "📁 What CSV format do I need for bulk predictions?",
        ]
    }


@router.get("/health")
def chatbot_health():
    """
    Chatbot service diagnostic health check.
    """
    api_key_configured = bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"))
    return {
        "status": "online",
        "gemini_api_configured": api_key_configured,
        "engine": "Gemini 1.5 Flash + Deterministic Domain RAG Engine",
        "rag_knowledge_base": "Active",
    }
