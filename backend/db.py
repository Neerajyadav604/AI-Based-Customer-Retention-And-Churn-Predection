# db.py - small SQLite helper: saves each upload and reads back the latest one.
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "app.db"   # file created next to main.py

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row            # lets us read columns by name
    return conn

def init_db():
    # Create the two tables if they do not exist yet
    conn = connect()
    conn.execute("""CREATE TABLE IF NOT EXISTS uploads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT, total INTEGER, high INTEGER,
        medium INTEGER, low INTEGER, avg_probability REAL)""")
    conn.execute("""CREATE TABLE IF NOT EXISTS upload_customers (
        upload_id INTEGER, customer_id TEXT, recency_days INTEGER,
        frequency INTEGER, monetary REAL,
        churn_probability REAL, risk_level TEXT)""")
    conn.commit()
    conn.close()

def save_upload(summary, customers):
    # One row in uploads + one row per customer in upload_customers
    avg = sum(c["churn_probability"] for c in customers) / len(customers)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    conn = connect()
    cur = conn.execute(
        "INSERT INTO uploads (created_at, total, high, medium, low, avg_probability) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (now, summary["total"], summary["high"], summary["medium"], summary["low"], avg))
    upload_id = cur.lastrowid
    conn.executemany(
        "INSERT INTO upload_customers VALUES (?, ?, ?, ?, ?, ?, ?)",
        [(upload_id, c["customer_id"], c["recency_days"], c["frequency"],
          c["monetary"], c["churn_probability"], c["risk_level"]) for c in customers])
    conn.commit()
    conn.close()

def get_latest_stats():
    # Summary of the most recent upload (zeros if nothing was uploaded yet)
    conn = connect()
    up = conn.execute("SELECT * FROM uploads ORDER BY id DESC LIMIT 1").fetchone()
    if up is None:
        conn.close()
        return {"total_customers": 0, "high": 0, "medium": 0, "low": 0,
                "avg_probability": 0, "last_upload_at": None, "top_customers": []}
    top = conn.execute(
        "SELECT customer_id, recency_days, frequency, monetary, churn_probability, risk_level "
        "FROM upload_customers WHERE upload_id = ? "
        "ORDER BY churn_probability DESC LIMIT 5", (up["id"],)).fetchall()
    conn.close()
    return {"total_customers": up["total"], "high": up["high"],
            "medium": up["medium"], "low": up["low"],
            "avg_probability": round(up["avg_probability"], 3),
            "last_upload_at": up["created_at"],
            "top_customers": [dict(row) for row in top]}