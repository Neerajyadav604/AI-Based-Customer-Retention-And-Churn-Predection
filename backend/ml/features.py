import pandas as pd

REQUIRED_COLUMNS = ["customer_id", "order_id", "order_date", "quantity", "unit_price"]

# Turn a list of orders into one row of features per customer
def build_customer_features(df):
    # Check that all needed columns are there
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError("Missing columns: " + ", ".join(missing))

    # Clean: real dates, numeric quantity and price, positive values only
    df = df.copy()
    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")
    df["unit_price"] = pd.to_numeric(df["unit_price"], errors="coerce")
    df = df.dropna(subset=["customer_id", "order_id", "order_date", "quantity", "unit_price"])
    df = df[(df["quantity"] > 0) & (df["unit_price"] > 0)]
    if df.empty:
        raise ValueError("No valid order rows found in the file")

    df["customer_id"] = df["customer_id"].astype(str)
    df["amount"] = df["quantity"] * df["unit_price"]

    # "Today" = the last order date in the file
    today = df["order_date"].max()

    # Same features as in training
    g = df.groupby("customer_id")
    features = pd.DataFrame({
        "recency_days": (today - g["order_date"].max()).dt.days,  # days since last order
        "frequency": g["order_id"].nunique(),                     # number of orders
        "monetary": g["amount"].sum(),                            # total money spent
        "tenure_days": (today - g["order_date"].min()).dt.days,   # days since first order
        "total_items": g["quantity"].sum(),                       # items bought
    })
    features["avg_order_value"] = features["monetary"] / features["frequency"]
    return features