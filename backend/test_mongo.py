# test_mongo.py - checks that we can reach MongoDB Atlas.
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()                                  # reads backend/.env
uri = os.getenv("MONGODB_URI")
if not uri:
    raise SystemExit("MONGODB_URI is missing in .env")

client = MongoClient(uri, serverSelectionTimeoutMS=5000)
client.admin.command("ping")                   # raises an error if we cannot connect
print("Connected to MongoDB Atlas")