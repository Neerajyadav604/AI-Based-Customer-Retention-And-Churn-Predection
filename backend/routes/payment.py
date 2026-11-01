# payment.py - Razorpay TEST-mode orders and plan upgrades.
import os
import uuid
from typing import Literal

import razorpay
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from razorpay.errors import SignatureVerificationError

from auth import current_user
from mongo import users
from plans import PLAN_PRICES, get_limit, get_plan, get_trials_left

load_dotenv()

router = APIRouter(tags=["payment"])

# Keys come from .env. Test keys start with rzp_test_ .
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


def razorpay_client():
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay keys are missing in .env")
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


class CreateOrderInput(BaseModel):
    plan: Literal["pro", "business"]


class VerifyInput(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan: Literal["pro", "business"]


@router.post("/payment/create-order")
def create_order(data: CreateOrderInput, user=Depends(current_user)):
    # Ask Razorpay to create an order for this plan's price.
    client = razorpay_client()
    order = client.order.create({
        "amount": PLAN_PRICES[data.plan],
        "currency": "INR",
        "receipt": str(uuid.uuid4())[:40],
        "notes": {"plan": data.plan, "email": user["email"]},
        "payment_capture": 1,
    })
    # key_id is needed by Razorpay Checkout on the frontend.
    return {"order": order, "key_id": RAZORPAY_KEY_ID, "plan": data.plan}


@router.post("/payment/verify")
def verify_payment(data: VerifyInput, user=Depends(current_user)):
    # NEVER upgrade the plan unless Razorpay says the signature is valid.
    client = razorpay_client()
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": data.razorpay_order_id,
            "razorpay_payment_id": data.razorpay_payment_id,
            "razorpay_signature": data.razorpay_signature,
        })
    except SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    users.update_one(
        {"email": user["email"]},
        {"$set": {"plan": data.plan}},
    )
    return {"message": f"Upgraded to {data.plan}", "plan": data.plan}


@router.get("/plan/me")
def my_plan(user=Depends(current_user)):
    plan = get_plan(user)
    return {
        "plan": plan,
        "trials_left": get_trials_left(user),
        "limit": get_limit(plan),
    }
