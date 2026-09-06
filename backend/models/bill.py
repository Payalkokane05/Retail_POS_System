from pydantic import BaseModel
from typing import List, Optional


class BillItem(BaseModel):
    name: str
    quantity: float


class BillRequest(BaseModel):
    customer: Optional[str] = None
    items: List[BillItem]