from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from auth import current_user, public_user
from mongo import users

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

INDUSTRIES = (
    "E-commerce and Retail", "Local Store / Kirana", "Telecommunications",
    "Banking and Financial Services", "SaaS and Technology", "Healthcare",
    "Insurance", "Education", "Media and Entertainment", "Logistics", "Other",
)
COMPANY_SIZES = (
    "Just me", "2-10 employees", "11-50 employees", "51-200 employees",
    "201-1,000 employees", "1,000+ employees",
)
ORG_ROLES = ("Owner", "Administrator", "Analyst", "Manager", "Member")
GOALS = (
    "predict_churn", "understand_why", "high_value_at_risk",
    "retention_strategies", "churn_trends", "evaluate_model",
)
DATA_CHOICES = ("csv", "sample", "not_ready")


class OnboardingInput(BaseModel):
    business_name: str | None = Field(default=None, max_length=120)
    industry: str | None = None
    company_size: str | None = None
    country: str | None = Field(default=None, max_length=80)
    org_role: str | None = None
    goals: list[str] | None = None
    data_choice: str | None = None
    customer_count: str | None = Field(default=None, max_length=40)
    onboarding_step: int | None = Field(default=None, ge=0)

    @field_validator("industry")
    @classmethod
    def valid_industry(cls, value):
        if value is not None and value not in INDUSTRIES:
            raise ValueError("Invalid industry")
        return value

    @field_validator("company_size")
    @classmethod
    def valid_company_size(cls, value):
        if value is not None and value not in COMPANY_SIZES:
            raise ValueError("Invalid company size")
        return value

    @field_validator("org_role")
    @classmethod
    def valid_org_role(cls, value):
        if value is not None and value not in ORG_ROLES:
            raise ValueError("Invalid organisation role")
        return value

    @field_validator("data_choice")
    @classmethod
    def valid_data_choice(cls, value):
        if value is not None and value not in DATA_CHOICES:
            raise ValueError("Invalid data choice")
        return value

    @field_validator("goals")
    @classmethod
    def valid_goals(cls, value):
        if value is not None and any(goal not in GOALS for goal in value):
            raise ValueError("Invalid goal")
        return value


@router.patch("")
def save_onboarding(data: OnboardingInput, user=Depends(current_user)):
    fields = data.model_dump(exclude_unset=True)
    if "business_name" in fields:
        fields["business_name"] = fields["business_name"].strip()
    if "business_name" in fields and not fields["business_name"].strip():
        raise HTTPException(status_code=400, detail="Business name is required for this step")
    if not fields:
        return public_user(user)

    users.update_one({"email": user["email"]}, {"$set": fields})
    user.update(fields)
    return public_user(user)


@router.post("/complete")
def complete_onboarding(user=Depends(current_user)):
    users.update_one(
        {"email": user["email"]},
        {"$set": {"onboarding_completed": True}},
    )
    user["onboarding_completed"] = True
    return public_user(user)
