import os
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI was not found in .env")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000) if MONGO_URI else None

db = client["retail_pos"] if client else None

products_collection = db["products"] if db is not None else None
customers_collection = db["customers"] if db is not None else None
bills_collection = db["bills"] if db is not None else None


def check_database_connection():
    if client is None:
        raise RuntimeError("MONGO_URI is missing from backend/.env")

    client.admin.command("ping")


def close_database_connection():
    if client is not None:
        client.close()

print("MongoDB connected successfully")