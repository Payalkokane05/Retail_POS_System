import sys
import os
from dotenv import load_dotenv

# Add parent directory (backend) to sys.path so 'tools' module can be found
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openrouter import ChatOpenRouter
from langchain_core.messages import HumanMessage, ToolMessage
from tools.billing_tool import calculate_bill

load_dotenv()

# llm = ChatGoogleGenerativeAI(
#     model="gemini-2.0-flash",
#     google_api_key=os.getenv("GOOGLE_API_KEY")
# )
llm = ChatOpenRouter(
    model="openrouter/free",              # Routes dynamically to active free models
    api_key=os.getenv("OPENROUTER_API_KEY"),
    temperature=0.7
)

llm_with_tools = llm.bind_tools([calculate_bill])

# Step 1: Send user message
messages = [HumanMessage(content="Create a bill for 2 rice and 1 oil.")]
ai_response = llm_with_tools.invoke(messages)
messages.append(ai_response)

print("AI wants to call:", ai_response.tool_calls)

# Step 2: Actually execute the tool the AI asked for
for tool_call in ai_response.tool_calls:
    if tool_call["name"] == "calculate_bill":
        result = calculate_bill.invoke(tool_call["args"])
        print("Tool result:", result)

        # Step 3: Send the tool's result back to the AI
        messages.append(ToolMessage(
            content=str(result),
            tool_call_id=tool_call["id"]
        ))

# Step 4: Get the AI's final natural-language reply
final_response = llm_with_tools.invoke(messages)
print("\nFinal AI reply:")
print(final_response.content)