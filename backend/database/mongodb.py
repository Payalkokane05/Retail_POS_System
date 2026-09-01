import os
from pathlib import Path

from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env from backend folder
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI was not found in .env")

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)

# Test connection
client.admin.command("ping")

# Database
db = client["retail_pos"]

# Collections
products_collection = db["products"]
customers_collection = db["customers"]
bills_collection = db["bills"]

print("MongoDB connected successfully")