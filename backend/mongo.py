# mongo.py - connects to MongoDB Atlas and gives us the "users" collection.
import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

try:
    import dns.resolver
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ["8.8.8.8", "1.1.1.1"]
except Exception:
    pass

load_dotenv(Path(__file__).parent / ".env")
uri = (os.getenv("MONGODB_URI") or "").strip()
client = MongoClient(uri, serverSelectionTimeoutMS=5000)
users = client["churnguard"]["users"]

# Two users cannot share an email. If Atlas is unreachable, predictions still work.
try:
    users.create_index("email", unique=True)
except Exception as e:
    print("MongoDB not reachable:", type(e).__name__)
