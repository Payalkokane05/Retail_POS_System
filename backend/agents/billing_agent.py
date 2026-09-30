import sys
import os
import json
import re
from uuid import uuid4
from typing import Annotated, TypedDict
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from langchain_openai import ChatOpenAI
from langchain_core.messages import (
    AIMessage,
    AnyMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from langgraph.checkpoint.mongodb import MongoDBSaver
from langgraph.errors import GraphRecursionError
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages

from database.mongodb import client, products_collection
from tools.billing_tool import (
    calculate_bill,
    get_customer_billing_history,
    get_shop_sales,
    save_bill,
    send_bill,
)
from tools.product_tool import get_product, add_product, update_product, delete_product
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
    get_customer_billing_history, get_shop_sales,
    get_product, add_product, update_product, delete_product,
    add_customer, get_customer, update_customer, delete_customer
]

TOOL_MAP = {t.name: t for t in ALL_TOOLS}
llm_with_tools = llm.bind_tools(ALL_TOOLS)

SYSTEM_PROMPT = """You are an assistant for a retail grocery shop. You understand
and respond fluently in English, Hindi, Marathi, Tamil, Bengali, and Telugu.

Always follow the selected response language supplied separately for this
request, even if the user writes in another language. Translate tool results
and explanations into that language. Preserve customer names, product names,
quantities, and currency values.

IMPORTANT: Product names in the database may use different languages or spellings.
Use the available product catalog supplied for each request. Match the user's
wording to a catalog item and pass its exact stored name to billing tools; do not
assume that a translated label is the stored name.

You can:
- Calculate and save bills (calculate_bill, save_bill, send_bill)
- View a customer's billing history (get_customer_billing_history) and shop sales (get_shop_sales)
- View product details (get_product) and manage products (add_product, update_product, delete_product)
- View customer details (get_customer) and manage customers (add_customer, update_customer, delete_customer)

When asked for a product's details, use get_product and report its current price,
unit, and tax. When asked for a customer's details, use get_customer with their
name or phone number and report the fields returned.

When renaming a product, call update_product with its current stored name in
name and the requested name in new_name. Do not add a renamed product as a new
product.

When asked for a customer's bills, purchase history, or spending over a time
period, use get_customer_billing_history with their name or phone and one of
today, day, week, month, or year. Interpret day/week/month/year as the last
24 hours/7 days/30 days/365 days. When asked for shop sales or revenue over a
period, use get_shop_sales with the same period options.

Quantity rules for billing (these phrases may appear in Hindi/Marathi too):
- "half kg"/"1/2 kg"/"आधा किलो"/"अर्धा किलो" = 0.5
- "paav"/"pav"/"quarter kg"/"पाव किलो" = 0.25
- "1kg"/"1 किलो" = 1
- No quantity mentioned = 1
- Packaged items (biscuits, milk packets) use plain counts, not weight.

When calling calculate_bill, include customer_name if the user mentioned a
person's name for this bill; leave it blank if no customer was mentioned.

Only call the tool that matches what the user is asking for. If the request isn't
related to any of these actions, reply normally in the selected language.

Do not repeat or summarize previous or saved bills unless the user explicitly
asks for bill history or purchase history. When creating a bill, use only the
items in the current request. Interpret short replies such as yes, no, or that
one only in relation to the immediately preceding assistant question or proposal;
never treat them as customer names or as a request to resume an older task. If
the reply is ambiguous, ask a brief clarification in the selected language.

If a customer tool result contains a "matches" list with more than one entry:
- Show the user a clear numbered list of all matches, including name and phone
  number for each, so they can visually identify the right person.
- Ask them to pick one by number, or by any distinguishing detail they know.
- Do NOT ask them to already know a phone number upfront — they may not.
- Once they clarify, use the matching phone number to complete the original
  action by calling the tool again with that phone number.
Translate this entire interaction fully into the selected language too.

You may also be continuing an earlier conversation. If a previous message left
something incomplete (e.g. you asked a question and the user is now answering
it), use that earlier context to complete the action instead of starting over
or getting confused.
"""


class BillingAgentState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
    language: str


LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "ta": "Tamil",
    "bn": "Bengali",
    "te": "Telugu",
}


def _system_instruction(language: str) -> str:
    language_name = LANGUAGE_NAMES.get(language.lower(), "English")
    instruction = (
        f"The selected response language is {language_name}. Every user-visible "
        f"sentence must be in {language_name}, regardless of the user's input "
        "language. Do not mix languages; preserve only proper names, product "
        "names, and brand names as written.\n\n"
        f"{SYSTEM_PROMPT}"
    )
    try:
        product_names = sorted(
            {
                str(product["name"]).strip()
                for product in products_collection.find({}, {"name": 1})
                if product.get("name")
            },
            key=str.casefold,
        )
    except Exception:
        product_names = []

    if product_names:
        instruction += (
            "\n\nAvailable product names in the database: "
            f"{json.dumps(product_names, ensure_ascii=False)}. Match the user's "
            "spoken or localized item names to these products and pass the exact "
            "stored name to billing tools. Never substitute a different product; "
            "if there is no clear match, ask the user to clarify."
        )

    return instruction


def _billing_report_tool_call(message: str) -> dict | None:
    lowered = message.lower()
    has_history = re.search(
        r"\b(history|purchases?|past bills?|buy|buys|bought|spending|spent|transactions?)\b",
        lowered,
    )
    has_sales = re.search(r"\b(sales?|revenue|turnover)\b", lowered)
    if not has_history and not has_sales:
        return None

    if has_sales and not has_history:
        tool_name = "get_shop_sales"
        arguments = {"period": _report_period(lowered)}
    else:
        excluded_words = {
            "a", "all", "and", "are", "bill", "bills", "billing", "bought",
            "customer", "customers", "day", "days", "details", "did", "for", "give",
            "has", "history", "how", "in", "last", "me", "month", "much",
            "of", "on", "past", "please", "purchase", "purchases", "revenue",
            "buy", "bought", "hour", "hours", "sale", "sales", "shop", "shopkeeper",
            "show", "spending", "spent", "the", "this", "today", "total", "transaction",
            "transactions", "turnover", "week", "were", "what", "year", "1", "7", "24",
            "30", "365",
        }
        customer_words = [
            re.sub(r"'s$", "", word, flags=re.IGNORECASE)
            for word in re.findall(r"[A-Za-z][A-Za-z'-]*", message)
            if word.lower() not in excluded_words
        ]
        if not customer_words:
            return None
        tool_name = "get_customer_billing_history"
        arguments = {
            "customer_name": " ".join(customer_words),
            "period": _report_period(lowered),
        }

    return {
        "name": tool_name,
        "args": arguments,
        "id": uuid4().hex,
        "type": "tool_call",
    }


def _report_period(message: str) -> str:
    if re.search(r"\b(today|this day)\b", message):
        return "today"
    if re.search(r"\b(year|365 days?)\b", message):
        return "year"
    if re.search(r"\b(month|30 days?)\b", message):
        return "month"
    if re.search(r"\b(week|7 days?)\b", message):
        return "week"
    if re.search(r"\b(yesterday|day|24 hours?)\b", message):
        return "day"
    return "month"


def call_model(state: BillingAgentState):
    last_message = state["messages"][-1] if state["messages"] else None
    if isinstance(last_message, HumanMessage) and isinstance(last_message.content, str):
        tool_call = _billing_report_tool_call(last_message.content)
        if tool_call:
            return {"messages": [AIMessage(content="", tool_calls=[tool_call])]}

    response = llm_with_tools.invoke(
        [
            SystemMessage(content=_system_instruction(state.get("language", "en"))),
            *_recent_messages(state["messages"]),
        ]
    )
    return {"messages": [response]}


def execute_tools(state: BillingAgentState):
    tool_messages = []

    for tool_call in state["messages"][-1].tool_calls:
        tool_name = tool_call["name"]
        tool = TOOL_MAP.get(tool_name)
        result = tool.invoke(tool_call["args"]) if tool else {
            "error": f"Unknown tool: {tool_name}"
        }

        tool_messages.append(
            ToolMessage(
                content=json.dumps(result, ensure_ascii=False, default=str),
                name=tool_name,
                tool_call_id=tool_call["id"],
            )
        )

    return {"messages": tool_messages}


def route_after_model(state: BillingAgentState):
    return "tools" if state["messages"][-1].tool_calls else END


workflow = StateGraph(BillingAgentState)
workflow.add_node("agent", call_model)
workflow.add_node("tools", execute_tools)
workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", route_after_model, {"tools": "tools", END: END})
workflow.add_edge("tools", "agent")

checkpointer = MongoDBSaver(client, db_name="retail_pos")
billing_graph = workflow.compile(checkpointer=checkpointer)


def _history_from_messages(messages):
    history = []
    for message in _recent_messages(messages):
        if isinstance(message, HumanMessage):
            history.append({"role": "user", "content": message.content})
        elif isinstance(message, AIMessage) and message.content:
            history.append({"role": "assistant", "content": message.content})
    return history


def _recent_messages(messages, max_user_turns: int = 4):
    user_turns = [
        index for index, message in enumerate(messages)
        if isinstance(message, HumanMessage)
    ]
    if len(user_turns) <= max_user_turns:
        return messages
    return messages[user_turns[-max_user_turns]:]


def get_billing_history(user_id: str) -> list[dict]:
    config = {"configurable": {"thread_id": str(user_id)}}
    snapshot = billing_graph.get_state(config)
    return _history_from_messages(snapshot.values.get("messages", []))


def clear_billing_history(user_id: str) -> None:
    checkpointer.delete_thread(str(user_id))


def run_billing_agent(
    user_message: str,
    user_id: str,
    max_iterations: int = 5,
    language: str = "en",
) -> dict:
    language = language.lower()
    if language not in LANGUAGE_NAMES:
        language = "en"

    config = {
        "configurable": {"thread_id": str(user_id)},
        "recursion_limit": max_iterations * 2 + 2,
    }
    previous_state = billing_graph.get_state(config)
    previous_count = len(previous_state.values.get("messages", []))

    try:
        result = billing_graph.invoke(
            {"messages": [HumanMessage(content=user_message)], "language": language},
            config=config,
        )
    except GraphRecursionError:
        result = billing_graph.get_state(config).values

    messages = result.get("messages", [])
    tool_results = {}
    for message in messages[previous_count:]:
        if not isinstance(message, ToolMessage) or not message.name:
            continue
        try:
            tool_results[message.name] = json.loads(message.content)
        except (TypeError, json.JSONDecodeError):
            tool_results[message.name] = message.content

    reply = "Reached maximum tool execution steps."
    for message in reversed(messages[previous_count:]):
        if isinstance(message, AIMessage) and message.content:
            reply = message.content
            break

    return {
        "reply": reply,
        "results": tool_results,
        "history": _history_from_messages(messages),
    }


if __name__ == "__main__":
    print(run_billing_agent(
        user_message="2 किलो तांदूळ आणि 1 तेल यांचे बिल तयार करा",
        user_id="local-dev",
        language="mr",
    ))