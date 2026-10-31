# db.py - SQLite helper: saves each user's uploads and history, reads them back.
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "app.db"

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row            # lets us read columns by name
    return conn

def now_text():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")

def init_db():
    conn = connect()
    conn.execute("""CREATE TABLE IF NOT EXISTS uploads (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT, created_at TEXT,
        total INTEGER, high INTEGER, medium INTEGER, low INTEGER, avg_probability REAL)""")
    conn.execute("""CREATE TABLE IF NOT EXISTS upload_customers (
        upload_id INTEGER, customer_id TEXT, recency_days INTEGER,
        frequency INTEGER, monetary REAL, churn_probability REAL, risk_level TEXT)""")
    conn.execute("""CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT,
        created_at TEXT, source TEXT, summary TEXT)""")
    conn.commit()
    conn.close()

def save_history(user_email, source, summary):
    # One line in the user's history (source is "single" or "upload")
    conn = connect()
    conn.execute("INSERT INTO history (user_email, created_at, source, summary) VALUES (?, ?, ?, ?)",
                 (user_email, now_text(), source, summary))
    conn.commit()
    conn.close()

def save_upload(user_email, summary, customers):
    avg = sum(c["churn_probability"] for c in customers) / len(customers)
    conn = connect()
    cur = conn.execute(
        "INSERT INTO uploads (user_email, created_at, total, high, medium, low, avg_probability) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (user_email, now_text(), summary["total"], summary["high"],
         summary["medium"], summary["low"], avg))
    upload_id = cur.lastrowid
    conn.executemany(
        "INSERT INTO upload_customers VALUES (?, ?, ?, ?, ?, ?, ?)",
        [(upload_id, c["customer_id"], c["recency_days"], c["frequency"],
          c["monetary"], c["churn_probability"], c["risk_level"]) for c in customers])
    conn.commit()
    conn.close()
    text = (f"{summary['total']} customers: {summary['high']} High, "
            f"{summary['medium']} Medium, {summary['low']} Low")
    save_history(user_email, "upload", text)

def get_latest_stats(user_email):
    # Summary of THIS user's most recent upload (zeros if they have none)
    conn = connect()
    up = conn.execute("SELECT * FROM uploads WHERE user_email = ? ORDER BY id DESC LIMIT 1",
                      (user_email,)).fetchone()
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

def get_history(user_email, limit=100):
    # Newest first
    conn = connect()
    rows = conn.execute(
        "SELECT id, created_at, source, summary FROM history "
        "WHERE user_email = ? ORDER BY id DESC LIMIT ?", (user_email, limit)).fetchall()
    conn.close()
    return [dict(row) for row in rows]