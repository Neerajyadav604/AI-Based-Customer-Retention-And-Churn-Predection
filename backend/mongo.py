# mongo.py - connects to MongoDB Atlas and gives us the "users" collection.
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
client = MongoClient(os.getenv("MONGODB_URI"), serverSelectionTimeoutMS=5000)
users = client["churnguard"]["users"]

# Two users cannot share an email. If Atlas is unreachable, predictions still work.
try:
    users.create_index("email", unique=True)
except Exception as e:
    print("MongoDB not reachable:", type(e).__name__)