from langchain.tools import tool
from database.mongodb import customers_collection


@tool
def add_customer(name: str, phone: str) -> dict:
    """Add a new customer to the database."""
    customers_collection.insert_one({"name": name, "phone": phone})
    return {"message": f"Customer '{name}' added successfully"}


@tool
def get_customer(name: str) -> dict:
    """Look up a customer by name."""
    customer = customers_collection.find_one({"name": name})
    if customer is None:
        return {"error": "Customer not found"}
    return {"name": customer["name"], "phone": customer["phone"]}


@tool
def update_customer(phone: str, name: str) -> dict:
    """Update a customer's name using their name."""
    result = customers_collection.update_one({"name": name}, {"$set": {"name": name}})
    if result.matched_count == 0:
        return {"error": "Customer not found"}
    return {"message": "Customer updated successfully"}


@tool
def delete_customer(name: str) -> dict:
    """Delete a customer by name."""
    result = customers_collection.delete_one({"name": name})
    if result.deleted_count == 0:
        return {"error": "Customer not found"}
    return {"message": "Customer deleted successfully"}