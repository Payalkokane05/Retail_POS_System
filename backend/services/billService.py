from database.mongodb import bills_collection
from services.productService import get_product_price
from services.customerService import find_customers_by_name
from datetime import datetime, timedelta
from bson import ObjectId
from re import escape


_BILLING_PERIODS = {
    "day": ("last 24 hours", 1),
    "today": ("today", 0),
    "week": ("last 7 days", 7),
    "month": ("last 30 days", 30),
    "year": ("last 365 days", 365),
}


def _billing_period(period: str) -> tuple[str, datetime] | None:
    normalized = period.strip().lower().replace("last ", "")
    normalized = {
        "1 day": "day",
        "7 days": "week",
        "30 days": "month",
        "365 days": "year",
        "1 year": "year",
    }.get(normalized, normalized)
    period_info = _BILLING_PERIODS.get(normalized)
    if period_info is None:
        return None

    label, days = period_info
    now = datetime.now()
    start = now.replace(hour=0, minute=0, second=0, microsecond=0) if days == 0 else now - timedelta(days=days)
    return label, start


def _sales_stats(query: dict) -> tuple[int, float]:
    result = list(bills_collection.aggregate([
        {"$match": query},
        {"$group": {
            "_id": None,
            "bill_count": {"$sum": 1},
            "total_sales": {
                "$sum": {"$ifNull": ["$grand_total", {"$ifNull": ["$total", 0]}]}
            },
        }},
    ]))
    if not result:
        return 0, 0.0
    return result[0]["bill_count"], float(result[0]["total_sales"])


def get_customer_billing_history(customer_name: str, period: str = "month") -> dict:
    period_info = _billing_period(period)
    if period_info is None:
        return {"error": "Period must be day, today, week, month, or year."}

    label, start = period_info
    customer_pattern = {"$regex": escape(customer_name.strip()), "$options": "i"}
    query = {
        "$and": [
            {"created_at": {"$gte": start}},
            {"$or": [
                {"customer_name": customer_pattern},
                {"customer": customer_pattern},
                {"customer_phone": customer_pattern},
            ]},
        ]
    }
    bill_count, total_spent = _sales_stats(query)
    bills = list(
        bills_collection.find(
            query,
            {"items": 1, "customer_name": 1, "customer": 1,
             "customer_phone": 1, "grand_total": 1, "total": 1,
             "created_at": 1},
        )
        .sort("created_at", -1)
        .limit(50)
    )
    for bill in bills:
        bill["_id"] = str(bill["_id"])
        if isinstance(bill.get("created_at"), datetime):
            bill["created_at"] = bill["created_at"].isoformat()

    return {
        "customer": customer_name,
        "period": label,
        "bill_count": bill_count,
        "total_spent": total_spent,
        "bills": bills,
        "bills_returned": len(bills),
    }


def get_shop_sales(period: str = "month") -> dict:
    period_info = _billing_period(period)
    if period_info is None:
        return {"error": "Period must be day, today, week, month, or year."}

    label, start = period_info
    bill_count, total_sales = _sales_stats({"created_at": {"$gte": start}})
    return {
        "period": label,
        "bill_count": bill_count,
        "total_sales": total_sales,
        "average_bill": round(total_sales / bill_count, 2) if bill_count else 0,
    }


def calculate_bill_logic(items: list[dict], customer_name: str = "") -> dict:
    """Calculate a bill using stored product prices. Does NOT add tax."""
    bill_items = []
    subtotal = 0

    for item in items:
        name = item["name"]
        quantity = item["quantity"]
        price, _tax_rate = get_product_price(name)

        if price is None:
            bill_items.append({"name": name, "quantity": quantity, "error": "Product not found"})
            continue

        item_subtotal = price * quantity
        bill_items.append({
            "name": name, "quantity": quantity, "unit_price": price,
            "tax_rate": 0, "subtotal": item_subtotal,
            "tax": 0, "total": item_subtotal
        })
        subtotal += item_subtotal

    return {
        "items": bill_items,
        "subtotal": subtotal,
        "tax": 0,
        "grand_total": subtotal,
        "customer_name": customer_name,
    }


def _attach_customer(bill_data: dict, customer_name: str = "") -> dict:
    """
    Save a bill. If customer_name matches exactly ONE registered customer,
    link the bill to them (name + phone attached). Otherwise, save under
    the plain typed name with no link — no new customer is ever auto-created.
    """
    name_to_check = customer_name or bill_data.get("customer_name", "")
    matches = find_customers_by_name(name_to_check) if name_to_check else []

    if len(matches) == 1:
        resolved_name = matches[0]["name"]
        resolved_phone = matches[0]["phone"]
        linked = True
    else:
        resolved_name = name_to_check or "Walk-in Customer"
        resolved_phone = ""
        linked = False

    bill_data["customer"] = resolved_name          # kept for older UI code that reads "customer"
    bill_data["customer_name"] = resolved_name
    bill_data["customer_phone"] = resolved_phone
    bill_data["linked_customer"] = linked
    return bill_data


def save_bill_logic(bill_data: dict, customer_name: str = "") -> dict:
    bill_data = _attach_customer(bill_data, customer_name)
    bill_data["created_at"] = datetime.now()

    result = bills_collection.insert_one(bill_data)

    return {
        "message": "Bill saved successfully",
        "bill_id": str(result.inserted_id),
        "linked_to_existing_customer": bill_data["linked_customer"],
    }


def update_bill_logic(bill_id: str, bill_data: dict, customer_name: str = "") -> dict:
    if not ObjectId.is_valid(bill_id):
        return {"error": "Invalid bill ID"}

    existing = bills_collection.find_one({"_id": ObjectId(bill_id)})
    if existing is None:
        return {"error": "Bill not found"}

    updated_bill = _attach_customer(bill_data, customer_name)
    updated_bill["created_at"] = existing.get("created_at", datetime.now())

    bills_collection.replace_one({"_id": ObjectId(bill_id)}, updated_bill)
    return {
        "message": "Bill updated successfully",
        "bill_id": bill_id,
        "linked_to_existing_customer": updated_bill["linked_customer"],
    }


def delete_bill_logic(bill_id: str) -> dict:
    if not ObjectId.is_valid(bill_id):
        return {"error": "Invalid bill ID"}

    result = bills_collection.delete_one({"_id": ObjectId(bill_id)})
    if result.deleted_count == 0:
        return {"error": "Bill not found"}

    return {"message": "Bill deleted successfully", "bill_id": bill_id}