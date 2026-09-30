from langchain.tools import tool
from services.productService import (
    add_product as _add_product,
    get_product_by_name,
    update_product_by_name,
    delete_product_by_name,
)


@tool
def get_product(name: str) -> dict:
    """Look up a product by name and return its current price, unit, and tax rate."""
    return get_product_by_name(name)


@tool
def add_product(name: str, price: float, unit: str = "piece", tax: float = 0) -> dict:
    """Add a new product to the database."""
    return _add_product(name, price, unit, tax)


@tool
def update_product(
    name: str,
    new_name: str = None,
    price: float = None,
    unit: str = None,
    tax: float = None,
) -> dict:
    """Update a product by its current name, optionally changing its name, price, unit, or tax."""
    return update_product_by_name(name, new_name, price, unit, tax)


@tool
def delete_product(name: str) -> dict:
    """Delete a product from the database."""
    return delete_product_by_name(name)