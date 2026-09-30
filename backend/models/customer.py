from pydantic import BaseModel, Field
from typing import Optional

class Customer(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    email: Optional[str] = None
    phone: str = Field(..., min_length=10, max_length=15)