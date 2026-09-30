from langchain.tools import tool
from services.billService import (
    calculate_bill_logic,
    get_customer_billing_history as _get_customer_billing_history,
    get_shop_sales as _get_shop_sales,
    save_bill_logic,
)
from services.smsService import send_sms


@tool
def calculate_bill(items: list[dict], customer_name: str = "") -> dict:
    """
    Calculate a bill from stored product prices without adding tax for a list of items: {"name": str, "quantity": float}.
    Include customer_name if the user mentioned a person's name; otherwise leave blank.
    """
    return calculate_bill_logic(items, customer_name)


@tool
def save_bill(bill_data: dict, customer_name: str = "") -> dict:
    """
    Save a calculated bill. Links to an existing registered customer if the
    name matches exactly one; otherwise saves under the plain typed name.
    """
    return save_bill_logic(bill_data, customer_name)

@tool
def get_customer_billing_history(customer_name: str, period: str = "month") -> dict:
    """Get a customer's bills and amount spent for today, day, week, month, or year."""
    if not customer_name.strip():
        return {"error": "A customer name or phone number is required."}
    return _get_customer_billing_history(customer_name, period)

@tool
def get_shop_sales(period: str = "month") -> dict:
    """Get shop-wide bill count, total sales, and average bill for a date period."""
    return _get_shop_sales(period)


@tool
def send_bill(bill_data: dict, phone_number: str) -> dict:
    """Send a bill summary by SMS to a customer's phone number."""
    message = f"Your bill: Total Rs.{bill_data.get('grand_total')}. Thank you!"
    return send_sms(phone_number, message)