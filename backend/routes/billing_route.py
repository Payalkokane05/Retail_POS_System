from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import require_user
from agents.billing_agent import clear_billing_history, get_billing_history, run_billing_agent

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    language: str = "en"


@router.get("/billing/agent/history")
def billing_history(_current_user: dict = Depends(require_user)):
    return {"history": get_billing_history(_current_user["user_id"])}


@router.delete("/billing/agent/history")
def clear_billing_history_route(_current_user: dict = Depends(require_user)):
    clear_billing_history(_current_user["user_id"])
    return {"message": "Chat history cleared"}


@router.post("/billing/agent")
def billing_chat(request: ChatRequest, _current_user: dict = Depends(require_user)):
    result = run_billing_agent(
        request.message,
        _current_user["user_id"],
        language=request.language,
    )
    return result