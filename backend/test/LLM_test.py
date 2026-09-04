# from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openrouter import ChatOpenRouter
from dotenv import load_dotenv
import os

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

response = llm.invoke("Say hello and confirm you are working.")
print(response.content)