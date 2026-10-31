from pydantic import BaseModel, Field

# What the API accepts for one customer
class CustomerInput(BaseModel):
    recency_days: float = Field(ge=0)    # days since last order
    frequency: int = Field(ge=1)         # number of orders
    monetary: float = Field(gt=0)        # total money spent
    tenure_days: float = Field(ge=0)     # days since first order
    total_items: int = Field(ge=1)       # total items bought

# What the API returns
class PredictionOutput(BaseModel):
    churn_probability: float
    risk_level: str
    likely_to_churn: bool