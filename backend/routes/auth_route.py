from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import bcrypt
import jwt
import os

from database.mongodb import db
from models.user import UserRegister, UserLogin

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"

users_collection = db["users"]


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: str, name: str) -> str:
    payload = {
        "user_id": user_id,
        "name": name,
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@router.post("/register")
def register(user: UserRegister):
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)
    result = users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
    })

    token = create_token(str(result.inserted_id), user.name)
    return {"message": "Registered successfully", "token": token, "name": user.name}


@router.post("/login")
def login(user: UserLogin):
    existing = users_collection.find_one({"email": user.email})
    if not existing or not verify_password(user.password, existing["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(str(existing["_id"]), existing["name"])
    return {"message": "Login successful", "token": token, "name": existing["name"]}