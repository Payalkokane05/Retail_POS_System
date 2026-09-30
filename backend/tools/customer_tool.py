from langchain.tools import tool
from services.customerService import (
    add_customer as _add_customer,
    get_customer_by_name,
    update_customer as _update_customer,
    delete_customer as _delete_customer,
)


@tool
def add_customer(name: str, phone: str) -> dict:
    """Add a new customer. Phone must be unique; names can repeat."""
    return _add_customer(name, phone)


@tool
def get_customer(name: str = None, phone: str = None) -> dict:
    """Show customer details by partial name or exact phone number."""
    return get_customer_by_name(name, phone)


@tool
def update_customer(name: str = None, phone: str = None, new_name: str = None, new_phone: str = None) -> dict:
    """Update a customer, identified by name and/or phone. If multiple match the name, phone is required."""
    return _update_customer(name, phone, new_name, new_phone)


@tool
def delete_customer(name: str = None, phone: str = None) -> dict:
    """Delete a customer, identified by name and/or phone. If multiple match the name, phone is required."""
    return _delete_customer(name, phone)