# plans.py - trial vs paid limits. No permanent free plan.
from fastapi import HTTPException
from mongo import users

# During a trial, one upload may have at most this many customers.
TRIAL_MAX_ROWS = 100

# Paid plans: max customers per upload.
PLAN_LIMITS = {
    "pro": 5000,
    "business": 50000,
}

# Prices in paise (Razorpay uses paise, not rupees).
# 49900 paise = Rs 499, 149900 paise = Rs 1499.
PLAN_PRICES = {
    "pro": 49900,
    "business": 149900,
}


def get_plan(user):
    # Old users may not have these fields yet. Treat them as a new trial.
    plan = user.get("plan") or "trial"
    if plan not in PLAN_LIMITS:
        return "trial"
    return plan


def get_trials_left(user):
    if "trials_left" not in user or user["trials_left"] is None:
        return 3
    return int(user["trials_left"])


def get_limit(plan):
    if plan in PLAN_LIMITS:
        return PLAN_LIMITS[plan]
    return TRIAL_MAX_ROWS


def check_access(user, rows):
    """Raise 403 if this user is not allowed to predict this many customers."""
    plan = get_plan(user)

    if plan == "trial":
        if get_trials_left(user) <= 0:
            raise HTTPException(
                status_code=403,
                detail="Your 3 free trials are finished. Please upgrade to continue.",
            )
        if rows > TRIAL_MAX_ROWS:
            raise HTTPException(
                status_code=403,
                detail=f"Trial allows at most {TRIAL_MAX_ROWS} customers per upload. Please upgrade to continue.",
            )
        return

    # Paid plan: only the row limit matters (unlimited predictions).
    limit = PLAN_LIMITS[plan]
    if rows > limit:
        raise HTTPException(
            status_code=403,
            detail=f"Your {plan} plan allows at most {limit} customers per upload.",
        )


def use_trial(user):
    """Subtract 1 trial AFTER a prediction succeeded. Paid users are unchanged."""
    if get_plan(user) != "trial":
        return
    left = get_trials_left(user) - 1
    users.update_one(
        {"email": user["email"]},
        {"$set": {"plan": "trial", "trials_left": left}},
    )
    user["plan"] = "trial"
    user["trials_left"] = left
