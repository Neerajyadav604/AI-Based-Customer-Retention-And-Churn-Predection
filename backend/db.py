import os
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import pymysql
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

SQLITE_DB_PATH = Path(__file__).parent / "churnguard.db"

# SSL is only used when MYSQL_SSL_CA is set.
CA = os.getenv("MYSQL_SSL_CA")
CA_PATH = os.path.join(os.path.dirname(__file__), CA) if CA else None

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

def iso_time(value):
    if value is None:
        return None
    if isinstance(value, str):
        return value
    if isinstance(value, datetime):
        return value.replace(tzinfo=timezone.utc).isoformat(timespec="seconds")
    return str(value)

def is_mysql_configured():
    host = os.getenv("MYSQL_HOST")
    user = os.getenv("MYSQL_USER")
    return bool(host and user)

def get_mysql_connection():
    if not is_mysql_configured():
        return None
    try:
        return pymysql.connect(
            host=os.getenv("MYSQL_HOST"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD") or "",
            database=os.getenv("MYSQL_DB"),
            charset="utf8mb4",
            ssl_ca=CA_PATH,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=False,
            connect_timeout=2,
        )
    except Exception:
        return None

def get_sqlite_connection():
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class DBContext:
    def __init__(self):
        mysql_conn = get_mysql_connection()
        if mysql_conn is not None:
            self.backend = "mysql"
            self.conn = mysql_conn
        else:
            self.backend = "sqlite"
            self.conn = get_sqlite_connection()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            if hasattr(self.conn, "rollback"):
                try:
                    self.conn.rollback()
                except Exception:
                    pass
        else:
            if hasattr(self.conn, "commit"):
                try:
                    self.conn.commit()
                except Exception:
                    pass
        try:
            self.conn.close()
        except Exception:
            pass

    def execute(self, query_mysql, params=()):
        if self.backend == "mysql":
            cursor = self.conn.cursor()
            cursor.execute(query_mysql, params)
            return cursor
        else:
            query_sqlite = query_mysql.replace("%s", "?")
            cursor = self.conn.cursor()
            converted_params = []
            for p in params:
                if isinstance(p, datetime):
                    converted_params.append(iso_time(p))
                else:
                    converted_params.append(p)
            cursor.execute(query_sqlite, tuple(converted_params))
            return cursor

    def executemany(self, query_mysql, params_list):
        if self.backend == "mysql":
            cursor = self.conn.cursor()
            cursor.executemany(query_mysql, params_list)
            return cursor
        else:
            query_sqlite = query_mysql.replace("%s", "?")
            cursor = self.conn.cursor()
            converted_list = []
            for row in params_list:
                converted_list.append(tuple(
                    iso_time(p) if isinstance(p, datetime) else p
                    for p in row
                ))
            cursor.executemany(query_sqlite, converted_list)
            return cursor

def init_db():
    # 1. Initialize SQLite database tables first (zero-configuration local fallback)
    try:
        conn = get_sqlite_connection()
        cur = conn.cursor()
        cur.execute("""CREATE TABLE IF NOT EXISTS uploads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            created_at TEXT,
            total INTEGER,
            high INTEGER,
            medium INTEGER,
            low INTEGER,
            avg_probability REAL,
            file_name TEXT,
            threshold_used REAL,
            model_name TEXT,
            total_records INTEGER DEFAULT 0,
            processed_records INTEGER DEFAULT 0,
            failed_records INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Completed',
            error_details TEXT DEFAULT NULL
        )""")
        # Migrate existing SQLite uploads table if columns are missing
        for col, col_def in (
            ("total_records", "INTEGER DEFAULT 0"),
            ("processed_records", "INTEGER DEFAULT 0"),
            ("failed_records", "INTEGER DEFAULT 0"),
            ("status", "TEXT DEFAULT 'Completed'"),
            ("error_details", "TEXT DEFAULT NULL"),
        ):
            try:
                cur.execute(f"ALTER TABLE uploads ADD COLUMN {col} {col_def}")
            except Exception:
                pass

        # Backfill legacy uploads where status or total_records is null
        try:
            cur.execute("""
                UPDATE uploads
                SET total_records = COALESCE((SELECT COUNT(*) FROM orders WHERE upload_id = uploads.id), total, 0),
                    processed_records = COALESCE((SELECT COUNT(*) FROM orders WHERE upload_id = uploads.id), total, 0),
                    failed_records = 0,
                    status = 'Completed'
                WHERE status IS NULL OR status = ''
            """)
        except Exception:
            pass
        cur.execute("""CREATE TABLE IF NOT EXISTS upload_customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            upload_id INTEGER,
            customer_id TEXT,
            recency_days INTEGER,
            frequency INTEGER,
            monetary REAL,
            tenure_days REAL,
            total_items REAL,
            avg_order_value REAL,
            churn_probability REAL,
            risk_level TEXT
        )""")
        cur.execute("""CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            created_at TEXT,
            source TEXT,
            summary TEXT,
            upload_id INTEGER,
            file_name TEXT,
            threshold_used REAL,
            model_name TEXT,
            prediction_data TEXT
        )""")
        cur.execute("""CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            upload_id INTEGER,
            user_email TEXT,
            customer_id TEXT,
            order_id TEXT,
            order_date TEXT,
            quantity REAL,
            unit_price REAL
        )""")
        conn.commit()
        conn.close()
    except Exception as e:
        print("SQLite init warning:", type(e).__name__, e)

    # 2. Try MySQL tables if MySQL is running
    try:
        mysql_conn = get_mysql_connection()
        if mysql_conn:
            try:
                with mysql_conn.cursor() as cursor:
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
                        ("uploads", "total_records", "INT DEFAULT 0"),
                        ("uploads", "processed_records", "INT DEFAULT 0"),
                        ("uploads", "failed_records", "INT DEFAULT 0"),
                        ("uploads", "status", "VARCHAR(50) DEFAULT 'Completed'"),
                        ("uploads", "error_details", "TEXT NULL"),
                        ("upload_customers", "tenure_days", "DOUBLE NULL"),
                        ("upload_customers", "total_items", "DOUBLE NULL"),
                        ("upload_customers", "avg_order_value", "DOUBLE NULL"),
                    ):
                        try:
                            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
                        except pymysql.err.OperationalError as error:
                            if error.args[0] != 1060:
                                raise
                mysql_conn.commit()
            finally:
                mysql_conn.close()
    except Exception as error:
        print("MySQL not reachable, using local storage:", type(error).__name__)

def save_history(user_email, source, summary, *, upload_id=None, file_name=None,
                 threshold_used=None, model_name=None, prediction_data=None):
    try:
        with DBContext() as db:
            cursor = db.execute(
                "INSERT INTO history (user_email, created_at, source, summary, upload_id, file_name, threshold_used, model_name, prediction_data) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (user_email, utc_now(), source, summary, upload_id, file_name,
                 threshold_used, model_name,
                 json.dumps(prediction_data) if prediction_data is not None else None),
            )
            return cursor.lastrowid
    except Exception as e:
        print("save_history error:", type(e).__name__, e)
        return None

def save_upload(user_email, summary, customers, file_name=None, threshold_used=None, model_name=None,
                total_records=0, processed_records=0, failed_records=0, status="Completed", error_details=None):
    values = [float(item["churn_probability"]) for item in customers]
    average = sum(values) / len(values) if values else 0
    try:
        with DBContext() as db:
            cursor = db.execute(
                "INSERT INTO uploads (user_email, created_at, total, high, medium, low, avg_probability, file_name, threshold_used, model_name, total_records, processed_records, failed_records, status, error_details) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (user_email, utc_now(), summary["total"], summary["high"],
                 summary["medium"], summary["low"], average, file_name,
                 threshold_used, model_name, total_records or summary["total"],
                 processed_records or summary["total"], failed_records, status, error_details),
            )
            upload_id = cursor.lastrowid
            rows = [(
                upload_id, item["customer_id"], item["recency_days"],
                item["frequency"], item["monetary"], item.get("tenure_days"),
                item.get("total_items"), item.get("avg_order_value"),
                item["churn_probability"], item["risk_level"],
            ) for item in customers]
            db.executemany(
                "INSERT INTO upload_customers (upload_id, customer_id, recency_days, frequency, monetary, tenure_days, total_items, avg_order_value, churn_probability, risk_level) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                rows,
            )
        text = f"{summary['total']} customers: {summary['high']} High, {summary['medium']} Medium, {summary['low']} Low"
        save_history(
            user_email, "upload", text, upload_id=upload_id, file_name=file_name,
            threshold_used=threshold_used, model_name=model_name,
        )
        return upload_id
    except Exception as e:
        print("save_upload error:", type(e).__name__, e)
        return None

def record_failed_upload(user_email, file_name, error_message, total_records=0, failed_records=0):
    try:
        with DBContext() as db:
            cursor = db.execute(
                "INSERT INTO uploads (user_email, created_at, total, high, medium, low, avg_probability, file_name, threshold_used, model_name, total_records, processed_records, failed_records, status, error_details) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (user_email, utc_now(), 0, 0, 0, 0, 0.0, file_name,
                 None, None, total_records, 0, failed_records or total_records, "Failed", error_message),
            )
            upload_id = cursor.lastrowid
            save_history(
                user_email, "upload", f"Failed: {file_name} ({error_message})",
                upload_id=upload_id, file_name=file_name,
            )
            return upload_id
    except Exception as e:
        print("record_failed_upload error:", type(e).__name__, e)
        return None

def save_orders(upload_id, user_email, orders):
    if upload_id is None:
        return
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
    try:
        with DBContext() as db:
            query = "INSERT INTO orders (upload_id, user_email, customer_id, order_id, order_date, quantity, unit_price) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            for start in range(0, len(rows), 5000):
                db.executemany(query, rows[start:start + 5000])
    except Exception as e:
        print("save_orders error:", type(e).__name__, e)

def get_latest_stats(user_email):
    try:
        with DBContext() as db:
            cursor = db.execute("SELECT * FROM uploads WHERE user_email = %s ORDER BY id DESC LIMIT 1", (user_email,))
            upload = cursor.fetchone()
            if upload is None:
                return {"total_customers": 0, "high": 0, "medium": 0, "low": 0, "avg_probability": 0, "last_upload_at": None, "top_customers": [], "all_customers": []}
            upload_dict = dict(upload)
            cursor2 = db.execute(
                "SELECT customer_id, recency_days, frequency, monetary, tenure_days, total_items, avg_order_value, churn_probability, risk_level "
                "FROM upload_customers WHERE upload_id = %s ORDER BY churn_probability DESC",
                (upload_dict["id"],)
            )
            customers = [dict(r) for r in cursor2.fetchall()]
            for c in customers:
                p = float(c.get("churn_probability") or 0)
                if p > 0.6:
                    c["risk_level"] = "High"
                elif p > 0.3:
                    c["risk_level"] = "Medium"
                else:
                    c["risk_level"] = "Low"

            high = sum(1 for c in customers if c["risk_level"] == "High")
            medium = sum(1 for c in customers if c["risk_level"] == "Medium")
            low = sum(1 for c in customers if c["risk_level"] == "Low")
            avg_prob = sum(float(c.get("churn_probability") or 0) for c in customers) / len(customers) if customers else float(upload_dict.get("avg_probability") or 0)

            return {
                "total_customers": len(customers) if customers else upload_dict["total"],
                "high": high,
                "medium": medium,
                "low": low,
                "avg_probability": round(avg_prob, 3),
                "last_upload_at": iso_time(upload_dict.get("created_at")),
                "top_customers": customers[:5],
                "all_customers": customers,
            }
    except Exception as e:
        print("get_latest_stats fallback:", type(e).__name__, e)
        return {"total_customers": 0, "high": 0, "medium": 0, "low": 0, "avg_probability": 0, "last_upload_at": None, "top_customers": [], "all_customers": []}

def get_latest_predictions(user_email):
    try:
        with DBContext() as db:
            cursor = db.execute(
                "SELECT id FROM uploads WHERE user_email = %s ORDER BY id DESC LIMIT 1",
                (user_email,)
            )
            upload = cursor.fetchone()
            if upload is None:
                return []
            upload_id = upload["id"]
            cursor2 = db.execute(
                "SELECT customer_id, recency_days, frequency, monetary, tenure_days, "
                "total_items, avg_order_value, churn_probability, risk_level "
                "FROM upload_customers WHERE upload_id = %s "
                "ORDER BY churn_probability DESC",
                (upload_id,)
            )
            customers = [dict(r) for r in cursor2.fetchall()]
            for c in customers:
                p = float(c.get("churn_probability") or 0)
                if p > 0.6:
                    c["risk_level"] = "High"
                elif p > 0.3:
                    c["risk_level"] = "Medium"
                else:
                    c["risk_level"] = "Low"
            return customers
    except Exception as e:
        print("get_latest_predictions fallback:", type(e).__name__, e)
        return []

def get_history(user_email, limit=100):
    try:
        with DBContext() as db:
            cursor = db.execute(
                "SELECT id, created_at, source, summary, upload_id, file_name, threshold_used, model_name "
                "FROM history WHERE user_email = %s ORDER BY id DESC LIMIT %s",
                (user_email, limit)
            )
            rows = [dict(r) for r in cursor.fetchall()]
            for row in rows:
                row["created_at"] = iso_time(row.get("created_at"))
            return rows
    except Exception as e:
        print("get_history fallback:", type(e).__name__, e)
        return []

def get_upload_history(user_email, limit=100):
    try:
        with DBContext() as db:
            cursor = db.execute(
                "SELECT id, user_email, created_at, total, high, medium, low, "
                "avg_probability, file_name, threshold_used, model_name, "
                "total_records, processed_records, failed_records, status, error_details "
                "FROM uploads WHERE user_email = %s ORDER BY id DESC LIMIT %s",
                (user_email, limit)
            )
            rows = [dict(r) for r in cursor.fetchall()]
            for row in rows:
                row["created_at"] = iso_time(row.get("created_at"))
                if not row.get("status"):
                    row["status"] = "Completed"
                if not row.get("total_records"):
                    row["total_records"] = row.get("total") or 0
                if not row.get("processed_records"):
                    row["processed_records"] = row.get("total") or 0
                if row.get("failed_records") is None:
                    row["failed_records"] = 0
            return rows
    except Exception as e:
        print("get_upload_history fallback:", type(e).__name__, e)
        return []

def get_upload_details(user_email, upload_id):
    try:
        with DBContext() as db:
            cursor = db.execute(
                "SELECT id, user_email, created_at, total, high, medium, low, "
                "avg_probability, file_name, threshold_used, model_name, "
                "total_records, processed_records, failed_records, status, error_details "
                "FROM uploads WHERE id = %s AND user_email = %s",
                (upload_id, user_email)
            )
            upload = cursor.fetchone()
            if upload is None:
                return None
            upload_dict = dict(upload)
            upload_dict["created_at"] = iso_time(upload_dict.get("created_at"))
            if not upload_dict.get("status"):
                upload_dict["status"] = "Completed"
            if not upload_dict.get("total_records"):
                upload_dict["total_records"] = upload_dict.get("total") or 0
            if not upload_dict.get("processed_records"):
                upload_dict["processed_records"] = upload_dict.get("total") or 0
            if upload_dict.get("failed_records") is None:
                upload_dict["failed_records"] = 0

            cursor2 = db.execute(
                "SELECT customer_id, recency_days, frequency, monetary, tenure_days, "
                "total_items, avg_order_value, churn_probability, risk_level "
                "FROM upload_customers WHERE upload_id = %s ORDER BY churn_probability DESC",
                (upload_id,)
            )
            customers = [dict(r) for r in cursor2.fetchall()]
            for c in customers:
                p = float(c.get("churn_probability") or 0)
                if p > 0.6:
                    c["risk_level"] = "High"
                elif p > 0.3:
                    c["risk_level"] = "Medium"
                else:
                    c["risk_level"] = "Low"

            # Compute probability distribution for this specific historical upload
            distribution = {
                "0-20": 0,
                "21-40": 0,
                "41-60": 0,
                "61-80": 0,
                "81-100": 0,
            }
            for c in customers:
                pct = float(c.get("churn_probability") or 0) * 100
                if pct <= 20:
                    distribution["0-20"] += 1
                elif pct <= 40:
                    distribution["21-40"] += 1
                elif pct <= 60:
                    distribution["41-60"] += 1
                elif pct <= 80:
                    distribution["61-80"] += 1
                else:
                    distribution["81-100"] += 1

            upload_dict["customers"] = customers
            upload_dict["distribution"] = distribution
            upload_dict["customer_count"] = len(customers)
            return upload_dict
    except Exception as e:
        print("get_upload_details fallback:", type(e).__name__, e)
        return None

def get_history_run(user_email, run_id):
    try:
        with DBContext() as db:
            cursor = db.execute(
                "SELECT id, user_email, created_at, source, summary, upload_id, file_name, "
                "threshold_used, model_name, prediction_data FROM history WHERE id = %s AND user_email = %s",
                (run_id, user_email),
            )
            run = cursor.fetchone()
            if run is None:
                return None
            run_dict = dict(run)
            run_dict["created_at"] = iso_time(run_dict.get("created_at"))
            if run_dict.get("upload_id") is not None:
                cursor2 = db.execute(
                    "SELECT u.id, u.created_at, u.total, u.high, u.medium, u.low, "
                    "u.avg_probability, u.file_name, u.threshold_used, u.model_name, "
                    "c.customer_id, c.recency_days, c.frequency, c.monetary, c.tenure_days, "
                    "c.total_items, c.avg_order_value, "
                    "c.churn_probability, c.risk_level "
                    "FROM uploads u JOIN upload_customers c ON c.upload_id = u.id "
                    "WHERE u.id = %s ORDER BY c.churn_probability DESC",
                    (run_dict["upload_id"],),
                )
                run_dict["customers"] = [dict(r) for r in cursor2.fetchall()]
            else:
                run_dict["customers"] = []
            return run_dict
    except Exception as e:
        print("get_history_run fallback:", type(e).__name__, e)
        return None
