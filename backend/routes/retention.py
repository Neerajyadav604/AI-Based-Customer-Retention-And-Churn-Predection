"""
routes/retention.py - Retention Intelligence endpoints for ChurnGuard AI.
Provides SHAP values, feature attribution, business consequences,
retention playbooks, and interactive action tracking.
"""

from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from auth import current_user
from db import get_upload_history, get_upload_details, get_customer_by_id
from ml.retention_intelligence import (
    calculate_customer_shap,
    get_dataset_retention_analysis,
    ACTION_TRACKING_STORE,
)

router = APIRouter(prefix="/api/retention", tags=["retention-intelligence"])


class ActionUpdatePayload(BaseModel):
    action_id: str
    status: str   # 'pending', 'in_progress', 'completed'
    notes: Optional[str] = None


@router.get("/analysis/{upload_id}")
def get_upload_retention(upload_id: int, user=Depends(current_user)):
    """
    Returns full retention intelligence analysis for an uploaded dataset.
    """
    analysis = get_dataset_retention_analysis(upload_id, user["email"])
    if not analysis:
        raise HTTPException(status_code=404, detail="Upload dataset not found or unauthorized.")
    return analysis


@router.get("/latest")
def get_latest_retention(user=Depends(current_user)):
    """
    Returns retention intelligence for the user's latest completed upload dataset.
    """
    uploads = get_upload_history(user["email"])
    completed = [u for u in uploads if u.get("status") in ["Completed", None] and u.get("total", 0) > 0]
    if not completed:
        raise HTTPException(status_code=404, detail="No completed upload datasets found.")
    
    latest_id = completed[0]["id"]
    analysis = get_dataset_retention_analysis(latest_id, user["email"])
    if not analysis:
        raise HTTPException(status_code=404, detail="Could not load latest retention dataset.")
    return analysis


@router.get("/customer/{customer_id}")
def get_customer_retention(customer_id: str, user=Depends(current_user)):
    """
    Calculate SHAP and retention intelligence for an individual customer.
    """
    cust = get_customer_by_id(customer_id, user["email"])
    if not cust:
        raise HTTPException(status_code=404, detail=f"Customer #{customer_id} not found.")
    
    analysis = calculate_customer_shap(cust)
    # Include saved action tracking state
    cust_actions = ACTION_TRACKING_STORE.get(str(customer_id), {})
    analysis["tracked_actions"] = cust_actions
    return analysis


@router.get("/actions/{customer_id}")
def get_customer_actions(customer_id: str, user=Depends(current_user)):
    """
    Retrieve tracked retention action statuses for a customer.
    """
    return ACTION_TRACKING_STORE.get(str(customer_id), {})


@router.post("/actions/{customer_id}")
def update_customer_action(customer_id: str, payload: ActionUpdatePayload, user=Depends(current_user)):
    """
    Update retention action status (Pending / In Progress / Completed) for a customer.
    """
    cid = str(customer_id)
    if cid not in ACTION_TRACKING_STORE:
        ACTION_TRACKING_STORE[cid] = {}
    
    ACTION_TRACKING_STORE[cid][payload.action_id] = {
        "status": payload.status,
        "notes": payload.notes or "",
    }
    return {
        "status": "success",
        "customer_id": cid,
        "actions": ACTION_TRACKING_STORE[cid],
    }
