from langchain.tools import tool
from database.mongodb import products_collection


@tool
def add_product(name: str, price: float, tax: float = 0) -> dict:
    """Add a new product to the database."""
    products_collection.insert_one({"name": name, "price": price, "tax": tax})
    return {"message": f"Product '{name}' added successfully"}


@tool
def update_product(name: str, price: float = None, tax: float = None) -> dict:
    """Update an existing product's price and/or tax."""
    update_fields = {}
    if price is not None:
        update_fields["price"] = price
    if tax is not None:
        update_fields["tax"] = tax

    if not update_fields:
        return {"message": "Nothing to update"}

    result = products_collection.update_one(
        {"name": {"$regex": f"^{name}$", "$options": "i"}},
        {"$set": update_fields}
    )
    if result.matched_count == 0:
        return {"error": f"Product '{name}' not found"}
    return {"message": f"Product '{name}' updated successfully"}


@tool
def delete_product(name: str) -> dict:
    """Delete a product from the database."""
    result = products_collection.delete_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
    if result.deleted_count == 0:
        return {"error": f"Product '{name}' not found"}
    return {"message": f"Product '{name}' deleted successfully"}