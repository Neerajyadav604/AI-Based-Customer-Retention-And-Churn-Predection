"""
routes/chat.py - Chatbot API endpoints for ChurnGuard AI.
Handles hybrid message exchange, conversation history, and suggestion chips.
Supports both POST /api/chat and POST /api/chat/message.
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
    DEFAULT_SUGGESTIONS,
)

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-prod")

router = APIRouter(prefix="/api/chat", tags=["chatbot"])


class ChatMessageRequest(BaseModel):
    message: Optional[str] = Field(None, max_length=1500)
    prompt: Optional[str] = Field(None, max_length=1500)
    session_id: Optional[str] = Field(None, max_length=100)
    conversation_id: Optional[str] = Field(None, max_length=100)
    context: Optional[Dict[str, Any]] = None


class ChatMessageResponse(BaseModel):
    reply: str
    intent: str
    layer: Optional[str] = None
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


@router.post("", response_model=ChatMessageResponse)
@router.post("/", response_model=ChatMessageResponse)
@router.post("/message", response_model=ChatMessageResponse)
async def chat_endpoint(req: ChatMessageRequest, request: Request):
    """
    Primary hybrid chat endpoint supporting POST /api/chat and POST /api/chat/message.
    """
    text = (req.message or req.prompt or "").strip()
    if not text:
        raise HTTPException(status_code=422, detail="Message content cannot be empty.")

    sid = req.session_id or req.conversation_id or "default_session"
    user_email = get_optional_user_email(request)

    try:
        result = process_chat_message(
            message=text,
            user_email=user_email,
            session_id=sid,
            context=req.context,
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
    return {"suggestions": DEFAULT_SUGGESTIONS}
