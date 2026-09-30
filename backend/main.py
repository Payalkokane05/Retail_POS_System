from contextlib import asynccontextmanager
import os
from bson import ObjectId
from fastapi import HTTPException

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import require_user
from database.mongodb import close_database_connection, check_database_connection, db
from models.product import Product
from models.customer import Customer
from models.bill import BillRequest

from routes.billing_route import router as billing_router
from routes.auth_route import router as auth_router
from routes.ocr_route import router as ocr_router
from routes.localization_route import router as localization_router

from services.customerService import (
    add_customer as add_customer_logic,
    update_customer,
    delete_customer,
)
from services.productService import (
    add_product as add_product_logic,
    update_product_by_name,
    delete_product_by_name,
)
from services.billService import (
    calculate_bill_logic,
    delete_bill_logic,
    save_bill_logic,
    update_bill_logic,
)
from services.smsService import send_sms


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        check_database_connection()
        print("MongoDB connected successfully")
    except Exception as exc:
        raise RuntimeError(
            "MongoDB startup check failed. Verify MONGO_URI in backend/.env."
        ) from exc

    yield
    close_database_connection()


app = FastAPI(
    title="Retail POS System",
    description="Conversational AI Framework for Intelligent Retail POS",
    version="1.0.0",
    lifespan=lifespan,
)

frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(billing_router)
app.include_router(auth_router)
app.include_router(ocr_router)
app.include_router(localization_router)


# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {"message": "Retail POS Backend is running"}


# =========================
# DATABASE TEST
# =========================

@app.get("/database-test")
def database_test(_current_user: dict = Depends(require_user)):
    collections = db.list_collection_names()
    return {"database": "connected", "collections": collections}


# =========================
# PRODUCTS
# =========================

@app.get("/products")
def get_products(_current_user: dict = Depends(require_user)):
    products = list(db["products"].find())
    for product in products:
        product["_id"] = str(product["_id"])
    return products


@app.post("/add-product")
def add_product(product: Product, _current_user: dict = Depends(require_user)):
    return add_product_logic(product.name, product.price, product.unit, product.tax)


@app.put("/products/{name}")
def update_product_route(name: str, product: Product, _current_user: dict = Depends(require_user)):
    result = update_product_by_name(
        name,
        new_name=product.name,
        price=product.price,
        unit=product.unit,
        tax=product.tax,
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.delete("/products/{name}")
def delete_product_route(name: str, _current_user: dict = Depends(require_user)):
    return delete_product_by_name(name)


# =========================
# CUSTOMERS
# =========================

@app.get("/customers")
def get_customers(_current_user: dict = Depends(require_user)):
    customers = list(db["customers"].find())
    for c in customers:
        c["_id"] = str(c["_id"])
    return customers


@app.post("/add-customers")
def add_customer(customer: Customer, _current_user: dict = Depends(require_user)):
    return add_customer_logic(customer.name, customer.phone)


@app.put("/customers/{phone}")
def update_customer_route(phone: str, customer: Customer, _current_user: dict = Depends(require_user)):
    return update_customer(phone=phone, new_name=customer.name,new_phone=customer.phone)

@app.delete("/customers/{phone}")
def delete_customer_route(phone: str, _current_user: dict = Depends(require_user)):
    return delete_customer(phone=phone)


# =========================
# BILLING
# =========================

@app.post("/billing/preview")
def preview_bill(bill: BillRequest, _current_user: dict = Depends(require_user)):
    items = [{"name": i.name, "quantity": i.quantity} for i in bill.items]
    return calculate_bill_logic(items, bill.customer or "")


@app.post("/billing/create")
def create_bill(bill: BillRequest, _current_user: dict = Depends(require_user)):
    items = [{"name": i.name, "quantity": i.quantity} for i in bill.items]
    calculated = calculate_bill_logic(items, bill.customer or "")
    return save_bill_logic(calculated, bill.customer or "")


@app.put("/billing/{bill_id}")
def update_bill(bill_id: str, bill: BillRequest, _current_user: dict = Depends(require_user)):
    items = [{"name": i.name, "quantity": i.quantity} for i in bill.items]
    calculated = calculate_bill_logic(items, bill.customer or "")
    return update_bill_logic(bill_id, calculated, bill.customer or "")


@app.delete("/billing/{bill_id}")
def delete_bill(bill_id: str, _current_user: dict = Depends(require_user)):
    return delete_bill_logic(bill_id)


@app.post("/billing/{bill_id}/send-sms")
def send_bill_sms(bill_id: str, _current_user: dict = Depends(require_user)):
    if not ObjectId.is_valid(bill_id):
        raise HTTPException(status_code=400, detail="Invalid bill ID")

    bill = db["bills"].find_one({"_id": ObjectId(bill_id)})
    if bill is None:
        raise HTTPException(status_code=404, detail="Bill not found")

    phone_number = bill.get("customer_phone")
    if not phone_number:
        raise HTTPException(
            status_code=400,
            detail="This bill does not have a customer phone number",
        )

    lines = [
        f"{item.get('name')}: {item.get('quantity')} x Rs.{item.get('unit_price', 0)}"
        for item in bill.get("items", [])
    ]
    message = (
        f"{bill.get('customer_name', 'Customer')}, your bill total is "
        f"Rs.{bill.get('grand_total', 0)}. "
        f"Items: {'; '.join(lines)}. Thank you!"
    )
    result = send_sms(phone_number, message)

    if not result.get("sent"):
        raise HTTPException(status_code=503, detail=result.get("error", result["message"]))

    return result


@app.get("/billing")
def get_bills(_current_user: dict = Depends(require_user)):
    bills = list(db["bills"].find())
    for bill in bills:
        bill["_id"] = str(bill["_id"])
        if "created_at" in bill:
            bill["created_at"] = bill["created_at"].isoformat()
    return bills