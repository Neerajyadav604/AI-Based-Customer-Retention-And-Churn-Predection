"""
retention_intelligence.py - Mathematical SHAP Decomposition, Feature Attribution,
and Prescriptive Retention Intelligence for ChurnGuard AI.
"""

import math
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
import joblib

ML_DIR = Path(__file__).parent
saved_model = joblib.load(ML_DIR / "churn_model.joblib")
pipeline = saved_model["pipeline"]
feature_names = saved_model["features"]
threshold = saved_model.get("threshold", 0.5)

# Extract standard scaler and logistic regression parameters for exact closed-form SHAP
scaler = pipeline[1]
classifier = pipeline[-1]

SCALER_MEAN = scaler.mean_
SCALER_SCALE = scaler.scale_
COEFFICIENTS = classifier.coef_[0]
INTERCEPT = float(classifier.intercept_[0])

FEATURE_LABELS = {
    "recency_days": "Days Since Last Purchase (Recency)",
    "frequency": "Total Order Count (Frequency)",
    "monetary": "Total Customer Spend (₹)",
    "tenure_days": "Relationship Duration (Tenure Days)",
    "total_items": "Total Items Purchased",
    "avg_order_value": "Average Order Value (₹)",
}

FEATURE_DESCRIPTIONS = {
    "recency_days": "Longer gaps between orders strongly indicate waning customer interest.",
    "frequency": "Frequent repeat orders indicate high brand loyalty and habituation.",
    "monetary": "Higher cumulative spend reflects greater financial commitment in Rupees (₹).",
    "tenure_days": "Longer account tenure typically offers loyalty stability.",
    "total_items": "Broad item purchase volume signals deep catalog engagement.",
    "avg_order_value": "Healthy average basket sizes demonstrate strong purchase intent.",
}

# In-memory store for action tracking status: { customer_id: { action_id: status, ... } }
ACTION_TRACKING_STORE: Dict[str, Dict[str, Any]] = {}


def sigmoid(z: float) -> float:
    """Logistic sigmoid function."""
    if z < -40:
        return 0.0
    if z > 40:
        return 1.0
    return 1.0 / (1.0 + math.exp(-z))


def calculate_customer_shap(customer_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes exact SHAP values for a customer's behavioral attributes
    using the trained ChurnGuard log-scale Logistic Regression pipeline.
    """
    # Extract raw features in pipeline order
    recency = float(customer_data.get("recency_days", 30))
    freq = max(1.0, float(customer_data.get("frequency", 1)))
    monetary = max(1.0, float(customer_data.get("monetary", 50)))
    tenure = max(1.0, float(customer_data.get("tenure_days", 60)))
    total_items = max(1.0, float(customer_data.get("total_items", 2)))
    aov = float(customer_data.get("avg_order_value") or (monetary / freq))

    raw_values = np.array([recency, freq, monetary, tenure, total_items, aov], dtype=float)

    # 1. Log transform: log1p(x)
    log_transformed = np.log1p(raw_values)

    # 2. Standardize
    scaled = (log_transformed - SCALER_MEAN) / SCALER_SCALE

    # 3. Exact SHAP values in log-odds space: phi_i = beta_i * x_scaled_i
    shap_log_odds = COEFFICIENTS * scaled
    total_logit = INTERCEPT + float(np.sum(shap_log_odds))

    # Actual probability
    prob = sigmoid(total_logit)
    base_prob = sigmoid(INTERCEPT)

    # Feature breakdown
    features_breakdown = []
    risk_drivers = []      # Features increasing churn risk (shap > 0)
    protective_drivers = []  # Features decreasing churn risk (shap < 0)

    # Waterfall progression tracking
    current_logit = INTERCEPT
    waterfall_steps = [
        {
            "step": "Base Population Model Rate",
            "feature": "Base Value",
            "contribution_log_odds": round(INTERCEPT, 4),
            "resulting_probability": round(base_prob * 100, 1),
            "direction": "neutral",
            "color": "#8C6819",
        }
    ]

    for i, name in enumerate(feature_names):
        val = raw_values[i]
        phi = float(shap_log_odds[i])
        current_logit += phi
        step_prob = sigmoid(current_logit)

        # Approximate marginal probability shift caused by this feature
        marginal_prob_shift = (sigmoid(INTERCEPT + phi) - base_prob) * 100

        item = {
            "feature": name,
            "label": FEATURE_LABELS.get(name, name),
            "description": FEATURE_DESCRIPTIONS.get(name, ""),
            "raw_value": round(val, 2),
            "unit": "days" if "days" in name else ("₹" if name in ["monetary", "avg_order_value"] else "units"),
            "shap_value": round(phi, 4),
            "impact_percentage": round(marginal_prob_shift, 1),
            "direction": "increases_churn" if phi > 0 else "decreases_churn",
        }
        features_breakdown.append(item)

        if phi > 0:
            risk_drivers.append(item)
        else:
            protective_drivers.append(item)

        waterfall_steps.append({
            "step": FEATURE_LABELS.get(name, name),
            "feature": name,
            "contribution_log_odds": round(phi, 4),
            "resulting_probability": round(step_prob * 100, 1),
            "direction": "positive" if phi > 0 else "negative",
            "color": "#B83838" if phi > 0 else "#43823C",
        })

    # Sort risk drivers by impact descending (biggest churn increase first)
    risk_drivers.sort(key=lambda x: x["shap_value"], reverse=True)
    # Sort protective drivers by magnitude descending (biggest safety shield first)
    protective_drivers.sort(key=lambda x: abs(x["shap_value"]), reverse=True)

    # Risk level classification
    if prob > 0.6:
        risk_tier = "High"
        risk_color = "#B83838"
    elif prob > 0.3:
        risk_tier = "Medium"
        risk_color = "#E6B95F"
    else:
        risk_tier = "Low"
        risk_color = "#43823C"

    # Business impact estimation
    annual_spend_est = max(monetary, aov * max(1.0, 365.0 / max(1.0, recency)))
    revenue_at_risk = round(annual_spend_est * prob, 2)
    clv_est = round(annual_spend_est * (3.0 if risk_tier == "Low" else (1.5 if risk_tier == "Medium" else 0.5)), 2)

    # Prescriptive retention recommendations based on top risk drivers
    top_driver = risk_drivers[0]["feature"] if risk_drivers else "general"
    recommendations = generate_customer_recommendations(top_driver, risk_tier, raw_values)

    return {
        "customer_id": str(customer_data.get("customer_id", "Unknown")),
        "churn_probability": round(prob, 3),
        "churn_percentage": round(prob * 100, 1),
        "risk_tier": risk_tier,
        "risk_color": risk_color,
        "base_model_probability": round(base_prob * 100, 1),
        "raw_attributes": {
            "recency_days": recency,
            "frequency": int(freq),
            "monetary": monetary,
            "tenure_days": tenure,
            "total_items": int(total_items),
            "avg_order_value": aov,
        },
        "features_breakdown": features_breakdown,
        "risk_drivers": risk_drivers,
        "protective_drivers": protective_drivers,
        "waterfall_steps": waterfall_steps,
        "business_consequences": {
            "estimated_annual_spend": round(annual_spend_est, 2),
            "revenue_at_risk": revenue_at_risk,
            "estimated_clv": clv_est,
            "cost_of_inaction": f"Loss of ₹{revenue_at_risk:,.2f} in annual recurring revenue.",
            "recommended_budget": f"Up to ₹{min(revenue_at_risk * 0.15, 6000.0):,.2f} in retention incentives.",
        },
        "recommendations": recommendations,
    }


def generate_customer_recommendations(primary_risk_driver: str, risk_tier: str, raw_features: np.ndarray) -> Dict[str, Any]:
    """
    Generates prescriptive, personalized retention playbooks,
    incentives, and phased action plans with clear, simple business reasoning.
    """
    recency = raw_features[0]
    freq = raw_features[1]
    monetary = raw_features[2]
    aov = raw_features[5]

    if primary_risk_driver == "recency_days" or recency > 90:
        headline = "Win-Back Reactivation Campaign"
        why_strategy = (
            f"This customer has not placed an order in {int(recency)} days. Long periods of silence are the #1 warning "
            f"sign of permanent churn. Instead of generic marketing, we apply an urgent win-back offer with a 72-hour "
            f"deadline to bring them back to your store immediately."
        )
        incentive_offer = "25% Reactivation Voucher + FREE Shipping"
        incentive_badge = "Win-Back 25% Off"
        loyalty_benefit = "Automatic Upgrade to Tier-2 Gold Rewards on Next Order"
        immediate_action = f"Send an automated WhatsApp / Email note: 'We Miss You! Here is 25% off your favorite items, valid for 72 hours.'"
        secondary_action = "Personal check-in message asking if their last delivery was satisfactory or if they need any assistance."
        nurture_action = "Schedule monthly replenishment reminders for the products they previously bought."
    elif primary_risk_driver == "frequency" or freq <= 2:
        headline = "Repeat Purchase Habituation Playbook"
        why_strategy = (
            f"This customer has only completed {int(freq)} order(s). Customers who only buy once or twice haven't formed a "
            f"regular shopping habit with your store yet. This strategy rewards their next 2 purchases with extra loyalty points "
            f"and bundle discounts to turn them into habitual repeat buyers."
        )
        incentive_offer = "15% Multi-Pack / Bundle Discount on Category Favorites"
        incentive_badge = "Bundle Booster 15%"
        loyalty_benefit = "Double Loyalty Points (2x Multiplier) on Next 2 Orders"
        immediate_action = "Send a tailored product recommendation email highlighting items that pair perfectly with their last purchase."
        secondary_action = "Share a 30-second customer feedback survey offering ₹100 instant wallet cash."
        nurture_action = "Trigger an automated restock reminder when their previous items are estimated to run out."
    elif primary_risk_driver == "avg_order_value" or aov < 40:
        headline = "Basket Size Expansion Strategy"
        why_strategy = (
            f"This customer's average order value is ₹{aov:,.2f}, which is below optimal levels. Providing a tiered threshold discount "
            f"(e.g., spend ₹2,000 and get ₹300 off) motivates them to add more items to their cart each time they shop."
        )
        incentive_offer = "Flat ₹300 Off on Carts Above ₹2,000 + Free Express Delivery"
        incentive_badge = "₹300 Off Threshold"
        loyalty_benefit = "Instant 250 Bonus Reward Points on Orders Above ₹1,500"
        immediate_action = "Present a smart checkout threshold banner offering ₹300 off if they add one more item to cart."
        secondary_action = "Promote best-selling bundles with single-click checkout discounts."
        nurture_action = "Introduce VIP perks milestone: unlock permanent free shipping on all orders this quarter."
    else:
        headline = "VIP Relationship Safeguard & Appreciation"
        why_strategy = (
            f"This customer is a valuable, high-spending client (₹{monetary:,.2f} lifetime value). Keeping high-tier accounts happy "
            f"costs 5x less than acquiring a new customer. This strategy recognizes their status with VIP perks and personalized support."
        )
        incentive_offer = "Exclusive Founder's Circle 10% Lifetime Loyalty Discount"
        incentive_badge = "VIP Appreciation 10%"
        loyalty_benefit = "Dedicated Concierge Account Specialist & Priority Delivery"
        immediate_action = "Send a personalized executive thank-you message from the store founder with an exclusive 10% lifetime VIP code."
        secondary_action = "Invite to early access preview of upcoming new product releases."
        nurture_action = "Host quarterly VIP check-in to collect product feedback and special requests."

    return {
        "headline": headline,
        "why_strategy": why_strategy,
        "primary_risk_driver": FEATURE_LABELS.get(primary_risk_driver, primary_risk_driver),
        "suggested_incentives": {
            "discount_offer": incentive_offer,
            "badge": incentive_badge,
            "loyalty_benefit": loyalty_benefit,
            "estimated_cost_per_save": f"₹{min(monetary * 0.12, 1200.0):,.2f}",
            "projected_roi": "3.8x to 5.2x ROI on saved retention revenue",
        },
        "action_plan": [
            {
                "id": "action_24h",
                "phase": "Immediate (0–24 Hours)",
                "title": "Send Targeted Offer & Message",
                "description": immediate_action,
                "urgency": "High",
                "channel": "WhatsApp / Email / SMS",
            },
            {
                "id": "action_7d",
                "phase": "Short-Term (Days 2–7)",
                "title": "Customer Success Engagement",
                "description": secondary_action,
                "urgency": "Medium",
                "channel": "Customer Success / Concierge",
            },
            {
                "id": "action_30d",
                "phase": "Long-Term (Days 8–30)",
                "title": "Loyalty & Habit Formation",
                "description": nurture_action,
                "urgency": "Low",
                "channel": "Automated Lifecycle Cadence",
            },
        ],
    }


def get_dataset_retention_analysis(upload_id: int, user_email: str) -> Optional[Dict[str, Any]]:
    """
    Extracts the full retention intelligence dataset for a given upload_id.
    """
    from db import get_upload_details

    details = get_upload_details(user_email, upload_id)
    if not details:
        return None

    raw_customers = details.get("customers", [])
    analyzed_customers = []

    for c in raw_customers:
        analysis = calculate_customer_shap(c)
        analyzed_customers.append(analysis)

    # Sort high risk first, then by churn percentage descending
    analyzed_customers.sort(key=lambda x: x["churn_percentage"], reverse=True)

    high_count = sum(1 for c in analyzed_customers if c["risk_tier"] == "High")
    med_count = sum(1 for c in analyzed_customers if c["risk_tier"] == "Medium")
    low_count = sum(1 for c in analyzed_customers if c["risk_tier"] == "Low")
    total_rev_at_risk = sum(c["business_consequences"]["revenue_at_risk"] for c in analyzed_customers)

    return {
        "upload_id": upload_id,
        "dataset_id": str(upload_id),
        "file_name": details.get("file_name", f"Upload #{upload_id}"),
        "created_at": details.get("created_at"),
        "total_customers": len(analyzed_customers),
        "high_risk_count": high_count,
        "medium_risk_count": med_count,
        "low_risk_count": low_count,
        "total_revenue_at_risk": round(total_rev_at_risk, 2),
        "customers": analyzed_customers,
    }
