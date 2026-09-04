import sys
import os
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage

from tools.billing_tool import calculate_bill, save_bill, send_bill
from tools.product_tool import add_product, update_product, delete_product
from tools.customer_tool import add_customer, get_customer, update_customer, delete_customer

load_dotenv()

llm = ChatOpenAI(
    model="google/gemini-2.5-flash",
    max_tokens=1000,
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1"
)

ALL_TOOLS = [
    calculate_bill, save_bill, send_bill,
    add_product, update_product, delete_product,
    add_customer, get_customer, update_customer, delete_customer
]

# lookup dict: tool name (string) -> actual function, so we don't need a long if/elif chain
TOOL_MAP = {t.name: t for t in ALL_TOOLS}

llm_with_tools = llm.bind_tools(ALL_TOOLS)

SYSTEM_PROMPT = """You are an assistant for a retail grocery shop. You can:
- Calculate and save bills (calculate_bill, save_bill, send_bill)
- Manage products (add_product, update_product, delete_product)
- Manage customers (add_customer, get_customer, update_customer, delete_customer)

Quantity rules for billing:
- "half kg"/"1/2 kg" = 0.5, "paav"/"pav"/"quarter kg" = 0.25, "1kg" = 1, no quantity = 1.
- Packaged items (biscuits, milk packets) use plain counts, not weight.

You can call multiple tools in sequence if the user's request requires multiple steps (e.g., updating a product price before calculating a bill).
Only call tools that match what the user is asking for. If the request isn't related to any of these actions, just reply normally without calling a tool.
"""


# ==============================================================================
# ORIGINAL IMPLEMENTATION (Single-Step / Kept for reference):
# ==============================================================================
# def run_billing_agent(user_message: str) -> dict:
#     messages = [
#         SystemMessage(content=SYSTEM_PROMPT),
#         HumanMessage(content=user_message)
#     ]
#     ai_response = llm_with_tools.invoke(messages)
#     messages.append(ai_response)
# 
#     tool_results = {}
# 
#     for tool_call in getattr(ai_response, "tool_calls", []):
#         tool_name = tool_call["name"]
#         tool_func = TOOL_MAP.get(tool_name)
# 
#         if tool_func:
#             result = tool_func.invoke(tool_call["args"])
#             tool_results[tool_name] = result
#             messages.append(ToolMessage(content=str(result), tool_call_id=tool_call["id"]))
# 
#     if tool_results:
#         final_response = llm_with_tools.invoke(messages)
#         return {"reply": final_response.content, "results": tool_results}
# 
#     return {"reply": ai_response.content, "results": {}}
# ==============================================================================


# ==============================================================================
# NOTE FOR FUTURE LANGGRAPH INTEGRATION:
# The loop below is a standard manual ReAct (Reason + Act) loop in Python.
# When you migrate to LangGraph later, you can replace this function with:
#
#   from langgraph.prebuilt import create_react_agent
#   graph = create_react_agent(llm, ALL_TOOLS, state_modifier=SYSTEM_PROMPT)
#   inputs = {"messages": [HumanMessage(content=user_message)]}
#   result = graph.invoke(inputs)
# ==============================================================================

def run_billing_agent(user_message: str, max_iterations: int = 5) -> dict:
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_message)
    ]
    tool_results = {}

    # Multi-turn loop: repeats until LLM stops calling tools and provides a final response
    for _ in range(max_iterations):
        ai_response = llm_with_tools.invoke(messages)
        messages.append(ai_response)

        # If no tool calls were generated, LLM finished its task and gave a final answer
        if not getattr(ai_response, "tool_calls", None):
            return {"reply": ai_response.content, "results": tool_results}

        # Execute all tool calls generated in this turn
        for tool_call in ai_response.tool_calls:
            tool_name = tool_call["name"]
            tool_func = TOOL_MAP.get(tool_name)

            if tool_func:
                result = tool_func.invoke(tool_call["args"])
                tool_results[tool_name] = result
                messages.append(
                    ToolMessage(content=str(result), tool_call_id=tool_call["id"])
                )

    # Fallback in case the model exceeds max iterations
    return {"reply": "Reached maximum tool execution steps.", "results": tool_results}


if __name__ == "__main__":
    # Test multi-step command: updates price AND calculates bill in one flow
    print(run_billing_agent("update price of bread with 20 and generate bill for 2 bread packets and save it"))