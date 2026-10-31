import os
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import pymysql
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

# Open a new MySQL connection.
def connect():
    return pymysql.connect(host=os.getenv("MYSQL_HOST"), port=int(os.getenv("MYSQL_PORT", "3306")),
                           user=os.getenv("MYSQL_USER"), password=os.getenv("MYSQL_PASSWORD"),
                           database=os.getenv("MYSQL_DB"), charset="utf8mb4",
                           cursorclass=pymysql.cursors.DictCursor, autocommit=False)

# Return a UTC datetime for MySQL DATETIME.
def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

# Return a UTC ISO timestamp for the API.
def iso_time(value):
    return None if value is None else value.replace(tzinfo=timezone.utc).isoformat(timespec="seconds")

# Create tables without stopping the API if MySQL is unavailable.
def init_db():
    try:
        conn = connect()
        try:
            with conn.cursor() as cursor:
                cursor.execute("CREATE TABLE IF NOT EXISTS uploads (id INT AUTO_INCREMENT PRIMARY KEY, user_email VARCHAR(255), created_at DATETIME, total INT, high INT, medium INT, low INT, avg_probability DOUBLE, INDEX (user_email)) ENGINE=InnoDB")
                cursor.execute("CREATE TABLE IF NOT EXISTS upload_customers (upload_id INT, customer_id VARCHAR(50), recency_days INT, frequency INT, monetary DOUBLE, churn_probability DOUBLE, risk_level VARCHAR(10), INDEX (upload_id)) ENGINE=InnoDB")
                cursor.execute("CREATE TABLE IF NOT EXISTS history (id INT AUTO_INCREMENT PRIMARY KEY, user_email VARCHAR(255), created_at DATETIME, source VARCHAR(10), summary VARCHAR(255), INDEX (user_email)) ENGINE=InnoDB")
                cursor.execute("CREATE TABLE IF NOT EXISTS orders (upload_id INT, user_email VARCHAR(255), customer_id VARCHAR(50), order_id VARCHAR(50), order_date DATETIME NULL, quantity DOUBLE, unit_price DOUBLE, INDEX (upload_id)) ENGINE=InnoDB")
            conn.commit()
        finally:
            conn.close()
    except Exception as error:
        print("MySQL not reachable:", type(error).__name__)

# Save one history item for a user.
def save_history(user_email, source, summary):
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO history (user_email, created_at, source, summary) VALUES (%s, %s, %s, %s)", (user_email, utc_now(), source, summary))
        conn.commit()
    finally:
        conn.close()

# Save an upload and its predicted customers.
def save_upload(user_email, summary, customers):
    values = [float(item["churn_probability"]) for item in customers]
    average = sum(values) / len(values) if values else 0
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO uploads (user_email, created_at, total, high, medium, low, avg_probability) VALUES (%s, %s, %s, %s, %s, %s, %s)", (user_email, utc_now(), summary["total"], summary["high"], summary["medium"], summary["low"], average))
            upload_id = cursor.lastrowid
            rows = [(upload_id, item["customer_id"], item["recency_days"], item["frequency"], item["monetary"], item["churn_probability"], item["risk_level"]) for item in customers]
            cursor.executemany("INSERT INTO upload_customers (upload_id, customer_id, recency_days, frequency, monetary, churn_probability, risk_level) VALUES (%s, %s, %s, %s, %s, %s, %s)", rows)
        conn.commit()
    finally:
        conn.close()
    text = f"{summary['total']} customers: {summary['high']} High, {summary['medium']} Medium, {summary['low']} Low"
    save_history(user_email, "upload", text)
    return upload_id

# Save raw CSV rows in batches of 5000.
def save_orders(upload_id, user_email, orders):
    rows = []
    for row in orders.itertuples(index=False):
        date = pd.to_datetime(row.order_date, errors="coerce")
        if pd.isna(date):
            date = None
        elif getattr(date, "tzinfo", None):
            date = date.tz_convert("UTC").tz_localize(None).to_pydatetime()
        else:
            date = date.to_pydatetime()
        values = [date, row.quantity, row.unit_price]
        rows.append((upload_id, user_email, str(row.customer_id), str(row.order_id),
                     *(None if pd.isna(value) else value for value in values)))
    conn = connect()
    try:
        with conn.cursor() as cursor:
            query = "INSERT INTO orders (upload_id, user_email, customer_id, order_id, order_date, quantity, unit_price) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            for start in range(0, len(rows), 5000):
                cursor.executemany(query, rows[start:start + 5000])
        conn.commit()
    finally:
        conn.close()

# Return the newest upload for one user.
def get_latest_stats(user_email):
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM uploads WHERE user_email = %s ORDER BY id DESC LIMIT 1", (user_email,))
            upload = cursor.fetchone()
            if upload is None:
                return {"total_customers": 0, "high": 0, "medium": 0, "low": 0, "avg_probability": 0, "last_upload_at": None, "top_customers": []}
            cursor.execute("SELECT customer_id, recency_days, frequency, monetary, churn_probability, risk_level FROM upload_customers WHERE upload_id = %s ORDER BY churn_probability DESC LIMIT 5", (upload["id"],))
            return {"total_customers": upload["total"], "high": upload["high"], "medium": upload["medium"], "low": upload["low"], "avg_probability": round(upload["avg_probability"], 3), "last_upload_at": iso_time(upload["created_at"]), "top_customers": cursor.fetchall()}
    finally:
        conn.close()

# Return newest history items for one user.
def get_history(user_email, limit=100):
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, created_at, source, summary FROM history WHERE user_email = %s ORDER BY id DESC LIMIT %s", (user_email, limit))
            rows = cursor.fetchall()
            for row in rows:
                row["created_at"] = iso_time(row["created_at"])
            return rows
    finally:
        conn.close()
