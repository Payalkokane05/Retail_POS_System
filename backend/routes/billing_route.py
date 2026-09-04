from fastapi import APIRouter 
from pydantic import BaseModel 
from agents.billing_agent import run_billing_agent

router=APIRouter()

class chatRequest(BaseModel):
    message: str 

@router.post("/billing/agent")
def billing_chat(request : chatRequest):
    result=run_billing_agent(request.message)
    return result
