from pydantic import BaseModel
from typing import List


class BillItem(BaseModel):
    name: str
    quantity: float
    mobile_number: Optional[str] = None
    customer_name: Optional[str] = None


class BillRequest(BaseModel):
    items: List[BillItem]