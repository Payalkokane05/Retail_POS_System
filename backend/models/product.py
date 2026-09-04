from pydantic import BaseModel, Field


class Product(BaseModel):
    name: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    tax: float = Field(default=0, ge=0, le=100)
    unit: str = Field(default="kg", description="Unit of measurement (e.g., kg, piece)")