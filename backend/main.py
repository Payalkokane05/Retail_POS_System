from datetime import datetime

from fastapi import FastAPI
from database.mongodb import db
from models.product import Product
from billing.bill import BillRequest


app = FastAPI(
    title="Retail POS System",
    description="Conversational AI Framework for Intelligent Retail POS",
    version="1.0.0"
)


# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {
        "message": "Retail POS Backend is running"
    }


# =========================
# HEALTH CHECK
# =========================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# =========================
# DATABASE TEST
# =========================

@app.get("/database-test")
def database_test():
    collections = db.list_collection_names()

    return {
        "database": "connected",
        "collections": collections
    }


# =========================
# ADD PRODUCT
# =========================

@app.post("/products")
def add_product(product: Product):
    product_data = product.model_dump()

    result = db["products"].insert_one(product_data)

    return {
        "message": "Product added successfully",
        "product_id": str(result.inserted_id)
    }


# =========================
# GET ALL PRODUCTS
# =========================

@app.get("/products")
def get_products():
    products = list(db["products"].find())

    for product in products:
        product["_id"] = str(product["_id"])

    return products


# =========================
# PREVIEW BILL
# OCR → PRODUCT → PRICE → TAX
# =========================

@app.post("/billing/preview")
def preview_bill(bill: BillRequest):

    bill_items = []
    subtotal = 0
    total_tax = 0

    for item in bill.items:

        product = db["products"].find_one({
            "name": {
                "$regex": f"^{item.name}$",
                "$options": "i"
            }
        })

        if product is None:
            return {
                "error": f"Product not found: {item.name}"
            }

        unit_price = product["price"]
        tax_rate = product.get("tax", 0)

        item_subtotal = unit_price * item.quantity
        item_tax = item_subtotal * tax_rate / 100
        item_total = item_subtotal + item_tax

        bill_items.append({
            "name": product["name"],
            "quantity": item.quantity,
            "unit_price": unit_price,
            "tax_rate": tax_rate,
            "subtotal": item_subtotal,
            "tax": item_tax,
            "total": item_total
        })

        subtotal += item_subtotal
        total_tax += item_tax

    grand_total = subtotal + total_tax

    return {
        "items": bill_items,
        "subtotal": subtotal,
        "tax": total_tax,
        "grand_total": grand_total
    }


# =========================
# CREATE AND SAVE BILL
# =========================

@app.post("/billing/create")
def create_bill(bill: BillRequest):

    bill_items = []
    subtotal = 0
    total_tax = 0

    for item in bill.items:

        product = db["products"].find_one({
            "name": {
                "$regex": f"^{item.name}$",
                "$options": "i"
            }
        })

        if product is None:
            return {
                "error": f"Product not found: {item.name}"
            }

        unit_price = product["price"]
        tax_rate = product.get("tax", 0)

        item_subtotal = unit_price * item.quantity
        item_tax = item_subtotal * tax_rate / 100
        item_total = item_subtotal + item_tax

        bill_items.append({
            "name": product["name"],
            "quantity": item.quantity,
            "unit_price": unit_price,
            "tax_rate": tax_rate,
            "subtotal": item_subtotal,
            "tax": item_tax,
            "total": item_total
        })

        subtotal += item_subtotal
        total_tax += item_tax

    grand_total = subtotal + total_tax

    bill_data = {
        "items": bill_items,
        "subtotal": subtotal,
        "tax": total_tax,
        "grand_total": grand_total,
        "created_at": datetime.now()
    }

    result = db["bills"].insert_one(bill_data)

    return {
        "message": "Bill created successfully",
        "bill_id": str(result.inserted_id),
        "subtotal": subtotal,
        "tax": total_tax,
        "grand_total": grand_total
    }


# =========================
# GET ALL SAVED BILLS
# =========================

@app.get("/billing")
def get_bills():

    bills = list(db["bills"].find())

    for bill in bills:
        bill["_id"] = str(bill["_id"])

        # Convert datetime so it can be returned as JSON
        if "created_at" in bill:
            bill["created_at"] = bill["created_at"].isoformat()

    return bills