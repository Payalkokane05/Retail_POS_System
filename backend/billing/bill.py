from pydantic import BaseModel
from typing import List


class BillItem(BaseModel):
    name: str
    quantity: int


class BillRequest(BaseModel):
    items: List[BillItem]