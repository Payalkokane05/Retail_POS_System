from langchain.tools import tool
from database.mongodb import products_collection
from datetime import datetime
from database.mongodb import bills_collection

def get_product_price(name: str):
    """
    Returns (price, tax_rate) for a product by name, or (None, None) if not found.
    Case-insensitive match against the real MongoDB products collection.
    """
    product = products_collection.find_one({
        "name": {"$regex": f"^{name}$", "$options": "i"}
    })

    if product is None:
        return None, None

    return product["price"], product.get("tax", 0)


@tool
def calculate_bill(items: list[dict]) -> dict:
    """
    Calculate the total bill for a list of items, including tax.
    Each item should be a dict like {"name": "Rice", "quantity": 2}.
    Quantity can be a decimal (e.g. 0.5 for half kg).
    """
    bill_items = []
    subtotal = 0
    total_tax = 0

    for item in items:
        name = item["name"]
        quantity = item["quantity"]
        price, tax_rate = get_product_price(name)

        if price is None:
            bill_items.append({
                "name": name,
                "quantity": quantity,
                "error": "Product not found"
            })
            continue

        item_subtotal = price * quantity
        item_tax = item_subtotal * tax_rate / 100
        item_total = item_subtotal + item_tax

        bill_items.append({
            "name": name,
            "quantity": quantity,
            "unit_price": price,
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

@tool
def save_bill(bill_data: dict) -> dict:
    """Save a calculated bill to the database. Call after calculate_bill, when user confirms."""
    bill_data["created_at"] = datetime.now()
    result = bills_collection.insert_one(bill_data)
    return {"message": "Bill saved successfully", "bill_id": str(result.inserted_id)}


@tool
def send_bill(bill_data: dict, phone_number: str) -> dict:
    """Send a bill to a customer's phone number. Call when user gives a phone number and asks to send."""
    message = f"Your bill: Total Rs.{bill_data.get('grand_total')}. Thank you!"
    # TODO: connect real SMS/WhatsApp API later
    return {"message": "Bill ready to send", "phone_number": phone_number, "sms_text": message}