import pandas as pd

# Load the cleaned orders
d = pd.read_csv("data/clean_orders.csv", parse_dates=["InvoiceDate"])

# Keep only orders before the same cutoff used in training
d = d[d["InvoiceDate"] < "2011-09-10"]

# Rename the columns to the upload format
d = d.rename(columns={"Customer ID": "customer_id", "Invoice": "order_id",
                      "InvoiceDate": "order_date", "Quantity": "quantity", "Price": "unit_price"})
d = d[["customer_id", "order_id", "order_date", "quantity", "unit_price"]]

# Pick 300 random customers and save all their orders
ids = d["customer_id"].drop_duplicates().sample(300, random_state=1)
sample = d[d["customer_id"].isin(ids)]
sample.to_csv("data/sample_orders.csv", index=False)
print("Saved", sample.shape[0], "rows for 300 customers")
