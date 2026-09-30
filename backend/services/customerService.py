from database.mongodb import customers_collection


def find_customers_by_name(name: str):
    """Returns ALL customers whose name CONTAINS this text (case-insensitive)."""
    return list(customers_collection.find({
        "name": {"$regex": name, "$options": "i"}
    }))


def add_customer(name: str, phone: str) -> dict:
    """Add a new customer. Phone number must be unique; name can repeat."""
    existing = customers_collection.find_one({"phone": phone})
    if existing:
        return {"message": f"A customer with phone {phone} already exists: {existing['name']}"}

    customers_collection.insert_one({"name": name, "phone": phone})
    return {"message": f"Customer '{name}' added successfully"}


def get_customer_by_name(name: str = None, phone: str = None) -> dict:
    """Look up customer details by partial name or exact phone number."""
    if phone:
        customer = customers_collection.find_one({"phone": phone})
        if not customer:
            return {"error": "No customer found with that phone number"}
        if name and name.lower() not in customer["name"].lower():
            return {"error": "No customer found with that name and phone number"}
        return {
            key: customer[key]
            for key in ("name", "phone", "email")
            if customer.get(key) is not None
        }

    if not name:
        return {"error": "Please provide a customer name or phone number"}

    matches = find_customers_by_name(name)

    if not matches:
        return {"error": f"No customer found matching '{name}'"}

    if len(matches) > 1:
        return {
            "message": f"Multiple customers matching '{name}' found. Please specify by phone number.",
            "matches": [
                {
                    key: customer[key]
                    for key in ("name", "phone", "email")
                    if customer.get(key) is not None
                }
                for customer in matches
            ],
        }

    customer = matches[0]
    return {
        key: customer[key]
        for key in ("name", "phone", "email")
        if customer.get(key) is not None
    }


def _resolve_customer(name: str = None, phone: str = None):
    """
    Finds one customer using whichever identifier is given.
    - phone alone: exact match (phone is always unique, so no ambiguity).
    - name alone: partial match; if more than one result, returns them as
      'matches' so the caller can ask which one is meant.
    - both: name narrows the search, phone picks the exact one among matches.
    """
    if phone and not name:
        customer = customers_collection.find_one({"phone": phone})
        if not customer:
            return None, {"error": "No customer found with that phone number"}
        return customer, None

    if name:
        matches = find_customers_by_name(name)
        if not matches:
            return None, {"error": f"No customer found matching '{name}'"}

        if len(matches) > 1:
            if phone:
                customer = next((c for c in matches if c["phone"] == phone), None)
                if not customer:
                    return None, {"error": "No customer found with that name and phone number"}
                return customer, None
            return None, {
                "message": f"Multiple customers matching '{name}' found. Please specify phone number.",
                "matches": [{"name": c["name"], "phone": c["phone"]} for c in matches],
            }

        return matches[0], None

    return None, {"error": "Please provide a name or phone number to identify the customer"}


def update_customer(name: str = None, phone: str = None, new_name: str = None, new_phone: str = None) -> dict:
    """Update a customer, found by name and/or phone (whichever is given)."""
    customer, error = _resolve_customer(name, phone)
    if error:
        return error

    update_fields = {}
    if new_name:
        update_fields["name"] = new_name
    if new_phone:
        update_fields["phone"] = new_phone
    if not update_fields:
        return {"message": "Nothing to update"}

    customers_collection.update_one({"_id": customer["_id"]}, {"$set": update_fields})
    return {"message": f"Customer '{customer['name']}' updated successfully"}


def delete_customer(name: str = None, phone: str = None) -> dict:
    """Delete a customer, found by name and/or phone (whichever is given)."""
    customer, error = _resolve_customer(name, phone)
    if error:
        return error

    customers_collection.delete_one({"_id": customer["_id"]})
    return {"message": f"Customer '{customer['name']}' deleted successfully"}