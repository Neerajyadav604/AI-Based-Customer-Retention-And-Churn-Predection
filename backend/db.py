import os
import json
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
                for table, column, definition in (
                    ("history", "upload_id", "INT NULL"),
                    ("history", "file_name", "VARCHAR(255) NULL"),
                    ("history", "threshold_used", "DOUBLE NULL"),
                    ("history", "model_name", "VARCHAR(120) NULL"),
                    ("history", "prediction_data", "LONGTEXT NULL"),
                    ("uploads", "file_name", "VARCHAR(255) NULL"),
                    ("uploads", "threshold_used", "DOUBLE NULL"),
                    ("uploads", "model_name", "VARCHAR(120) NULL"),
                    ("upload_customers", "tenure_days", "DOUBLE NULL"),
                    ("upload_customers", "total_items", "DOUBLE NULL"),
                    ("upload_customers", "avg_order_value", "DOUBLE NULL"),
                ):
                    try:
                        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
                    except pymysql.err.OperationalError as error:
                        if error.args[0] != 1060:
                            raise
            conn.commit()
        finally:
            conn.close()
    except Exception as error:
        print("MySQL not reachable:", type(error).__name__)

# Save one history item for a user.
def save_history(user_email, source, summary, *, upload_id=None, file_name=None,
                 threshold_used=None, model_name=None, prediction_data=None):
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO history (user_email, created_at, source, summary, upload_id, file_name, threshold_used, model_name, prediction_data) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (user_email, utc_now(), source, summary, upload_id, file_name,
                 threshold_used, model_name,
                 json.dumps(prediction_data) if prediction_data is not None else None),
            )
            history_id = cursor.lastrowid
        conn.commit()
    finally:
        conn.close()
    return history_id

# Save an upload and its predicted customers.
def save_upload(user_email, summary, customers, file_name=None, threshold_used=None, model_name=None):
    values = [float(item["churn_probability"]) for item in customers]
    average = sum(values) / len(values) if values else 0
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO uploads (user_email, created_at, total, high, medium, low, avg_probability, file_name, threshold_used, model_name) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (user_email, utc_now(), summary["total"], summary["high"],
                 summary["medium"], summary["low"], average, file_name,
                 threshold_used, model_name),
            )
            upload_id = cursor.lastrowid
            rows = [(
                upload_id, item["customer_id"], item["recency_days"],
                item["frequency"], item["monetary"], item.get("tenure_days"),
                item.get("total_items"), item.get("avg_order_value"),
                item["churn_probability"], item["risk_level"],
            ) for item in customers]
            cursor.executemany(
                "INSERT INTO upload_customers (upload_id, customer_id, recency_days, frequency, monetary, tenure_days, total_items, avg_order_value, churn_probability, risk_level) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                rows,
            )
        conn.commit()
    finally:
        conn.close()
    text = f"{summary['total']} customers: {summary['high']} High, {summary['medium']} Medium, {summary['low']} Low"
    history_id = save_history(
        user_email, "upload", text, upload_id=upload_id, file_name=file_name,
        threshold_used=threshold_used, model_name=model_name,
    )
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


def get_latest_predictions(user_email):
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT u.id FROM uploads u WHERE u.user_email = %s ORDER BY u.id DESC LIMIT 1",
                (user_email,),
            )
            upload = cursor.fetchone()
            if upload is None:
                return []
            cursor.execute(
                "SELECT customer_id, recency_days, frequency, monetary, tenure_days, "
                "total_items, avg_order_value, churn_probability, risk_level "
                "FROM upload_customers WHERE upload_id = %s "
                "ORDER BY churn_probability DESC",
                (upload["id"],),
            )
            return cursor.fetchall()
    finally:
        conn.close()


# Return newest history items for one user.
def get_history(user_email, limit=100):
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, created_at, source, summary, file_name FROM history WHERE user_email = %s ORDER BY id DESC LIMIT %s", (user_email, limit))
            rows = cursor.fetchall()
            for row in rows:
                row["created_at"] = iso_time(row["created_at"])
            return rows
    finally:
        conn.close()


def get_history_run(user_email, run_id):
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, user_email, created_at, source, summary, upload_id, file_name, "
                "threshold_used, model_name, prediction_data FROM history WHERE id = %s AND user_email = %s",
                (run_id, user_email),
            )
            run = cursor.fetchone()
            if run is None:
                return None
            if run["upload_id"] is not None:
                cursor.execute(
                    "SELECT u.id, u.created_at, u.total, u.high, u.medium, u.low, "
                    "u.avg_probability, u.file_name, u.threshold_used, u.model_name, "
                    "c.customer_id, c.recency_days, c.frequency, c.monetary, c.tenure_days, "
                    "c.total_items, c.avg_order_value, "
                    "c.churn_probability, c.risk_level "
                    "FROM uploads u JOIN upload_customers c ON c.upload_id = u.id "
                    "WHERE u.id = %s ORDER BY c.churn_probability DESC",
                    (run["upload_id"],),
                )
                run["customers"] = cursor.fetchall()
            else:
                run["customers"] = []
            return run
    finally:
        conn.close()
