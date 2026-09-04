import os
from pathlib import Path

from pymongo import MongoClient
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI was not found in .env")

client = MongoClient(MONGO_URI)
client.admin.command("ping")

db = client["retail_pos"]

products_collection = db["products"]
customers_collection = db["customers"]
bills_collection = db["bills"]

print("MongoDB connected successfully")