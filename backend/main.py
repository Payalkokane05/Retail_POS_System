from datetime import datetime

from fastapi import FastAPI
from database.mongodb import db
from models.product import Product
from models.bill import BillRequest
from routes.billing_route import router as billing_router
from models.customer import Customer

app = FastAPI(
    title="Retail POS System",
    description="Conversational AI Framework for Intelligent Retail POS",
    version="1.0.0"
)

app.include_router(billing_router)

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

@app.post("/add-product")
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


# =========================
# UPDATE PRODUCT
# =========================

@app.put("/products/{name}")
def update_product(name: str, product: Product):
    result = db["products"].update_one(
        {"name": {"$regex": f"^{name}$", "$options": "i"}},
        {"$set": product.model_dump()}
    )
    if result.matched_count == 0:
        return {"error": f"Product '{name}' not found"}
    return {"message": f"Product '{name}' updated successfully"}


# =========================
# DELETE PRODUCT
# =========================

@app.delete("/products/{name}")
def delete_product(name: str):
    result = db["products"].delete_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
    if result.deleted_count == 0:
        return {"error": f"Product '{name}' not found"}
    return {"message": f"Product '{name}' deleted successfully"}


# =========================
# ADD CUSTOMER
# =========================

@app.post("/add-customers")
def add_customer(customer: Customer):
    result = db["customers"].insert_one(customer.model_dump())
    return {"message": "Customer added successfully", "customer_id": str(result.inserted_id)}


# =========================
# GET ALL CUSTOMERS
# =========================

@app.get("/customers")
def get_customers():
    customers = list(db["customers"].find())
    for c in customers:
        c["_id"] = str(c["_id"])
    return customers


# =========================
# UPDATE CUSTOMER
# =========================

@app.put("/customers/{name}")
def update_customer(name: str, customer: Customer):
    result = db["customers"].update_one({"name": {"$regex": f"^{name}$", "$options": "i"}}, {"$set": customer.model_dump()})
    if result.matched_count == 0:
        return {"error": "Customer not found"}
    return {"message": "Customer updated successfully"}


# =========================
# DELETE CUSTOMER
# =========================

@app.delete("/customers/{name}")
def delete_customer(name: str):
    result = db["customers"].delete_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
    if result.deleted_count == 0:
        return {"error": "Customer not found"}
    return {"message": "Customer deleted successfully"}