from database.mongodb import products_collection
from re import escape


def find_product_by_name(name: str):
    """Exact, case-insensitive match — returns the product doc or None."""
    return products_collection.find_one({
        "name": {"$regex": f"^{escape(name.strip())}$", "$options": "i"}
    })


def get_product_price(name: str):
    """Returns (price, tax_rate) or (None, None) if not found."""
    product = find_product_by_name(name)
    if product is None:
        return None, None
    return product["price"], product.get("tax", 0)


def get_product_by_name(name: str) -> dict:
    product = find_product_by_name(name)
    if product is None:
        return {"error": f"Product '{name}' not found"}

    return {
        "name": product["name"],
        "price": product["price"],
        "unit": product.get("unit", "piece"),
        "tax": product.get("tax", 0),
    }


def add_product(name: str, price: float, unit: str = "piece", tax: float = 0) -> dict:
    existing = find_product_by_name(name)
    if existing:
        return {"message": f"Product '{existing['name']}' already exists"}

    products_collection.insert_one({"name": name, "price": price, "unit": unit, "tax": tax})
    return {"message": f"Product '{name}' added successfully"}


def update_product_by_name(
    name: str,
    new_name: str = None,
    price: float = None,
    unit: str = None,
    tax: float = None,
) -> dict:
    product = find_product_by_name(name)
    if product is None:
        return {"error": f"Product '{name}' not found"}

    update_fields = {}
    if new_name is not None:
        new_name = new_name.strip()
        if not new_name:
            return {"error": "Product name cannot be empty"}
        duplicate = find_product_by_name(new_name)
        if duplicate and duplicate["_id"] != product["_id"]:
            return {"error": f"Product '{new_name}' already exists"}
        update_fields["name"] = new_name
    if price is not None:
        update_fields["price"] = price
    if unit is not None:
        update_fields["unit"] = unit
    if tax is not None:
        update_fields["tax"] = tax
    if not update_fields:
        return {"message": "Nothing to update"}

    products_collection.update_one({"_id": product["_id"]}, {"$set": update_fields})
    return {"message": f"Product '{update_fields.get('name', product['name'])}' updated successfully"}


def delete_product_by_name(name: str) -> dict:
    product = find_product_by_name(name)
    if product is None:
        return {"error": f"Product '{name}' not found"}

    products_collection.delete_one({"_id": product["_id"]})
    return {"message": f"Product '{product['name']}' deleted successfully"}