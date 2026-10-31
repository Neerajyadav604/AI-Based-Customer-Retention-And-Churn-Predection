# test_mysql.py - checks that Python can connect to the MySQL database
import os
import pymysql
from dotenv import load_dotenv

load_dotenv()  # read the MYSQL_* settings from the .env file

try:
    conn = pymysql.connect(
        host=os.getenv("MYSQL_HOST"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DB"),
    )
    with conn.cursor() as cur:
        cur.execute("SELECT VERSION()")  # simple query to prove the link works
        print("Connected to MySQL, version", cur.fetchone()[0])
    conn.close()
except Exception as e:
    # print only the error type, never the message (it can contain secrets)
    print("MySQL connection failed:", type(e).__name__)