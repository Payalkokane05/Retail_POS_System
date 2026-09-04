from pydantic import BaseModel,Field

class Customer(BaseModel):
    name:str=Field(...,min_length=3,max_length=50)
    email:str=Field(...,min_length=10,max_length=50)
    phone:str=Field(...,min_length=10,max_length=15)