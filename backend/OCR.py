import os
import base64
import json
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

load_dotenv()

# Initialize OpenRouter Vision Model (Free Tier)
vision_llm = ChatOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    model="openrouter/free",  # or "google/gemma-4-31b-it:free"
    temperature=0
)

def extract_items_from_image(image_path: str) -> dict:
    """
    Reads an image (handwritten or printed receipt/list in Marathi & English),
    corrects handwriting/OCR misspellings, normalizes units (like 'पावशे' -> 0.25 kg),
    and translates items into clear English and standardized Marathi.
    """
    if not os.path.exists(image_path):
        return {"error": f"File '{image_path}' not found."}

    # 1. Read & base64 encode image
    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")

    prompt = """
    You are an intelligent retail grocery POS assistant specialized in handwritten and printed shopping lists / receipts.
    The text is in Marathi (मराठी), English, or mixed handwriting.

    Your task:
    1. Read and transcribe each grocery item accurately.
    2. Correct common Marathi handwriting OCR misreadings & colloquial shop terms:
       - 'टाटामीह' -> Tata Salt (टाटा मीठ)
       - 'खडामीह' -> Rock Salt (खडे मीठ)
       - 'हैदड' / 'हळद' -> Turmeric Powder (हळद)
       - 'लांबुल' / 'तांदूळ' -> Rice (तांदूळ)
       - 'वोहे' / 'पोहे' -> Poha / Flattened Rice (पोहे)
       - 'कारिक' / 'खारिक' -> Dry Dates (खारिक)
       - 'हिंगपूड' -> Asafoetida Powder (हिंग पूड)
       - 'नैवेद्य डब्बा' -> Puja / Naivedya Box
    3. Separate quantities and units from item names:
       - 'पावशे' / 'पावशेर' / 'पाव' = 0.25 kg (quarter kg) -> extract '0.25' as quantity and 'kg' as unit, remove 'पावशे' from the item name.
       - '500 gram' or 'अर्धा किलो' = 0.5 kg -> convert to 0.5 kg.
       - '1 kg' -> 1.0 kg.
    4. Provide clear English names so any human can easily understand every item.

    Return ONLY a valid JSON object in this format:
    {
      "items": [
        {
          "item_name_english": "Kolam Rice",
          "item_name_marathi": "कोलम तांदूळ",
          "quantity": 5.0,
          "unit": "kg",
          "original_text": "कोलम तांदूळ 5 kg"
        }
      ]
    }
    """

    message = HumanMessage(
        content=[
            {"type": "text", "text": prompt},
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}
            }
        ]
    )

    response = vision_llm.invoke([message])
    
    # Clean up markdown codeblocks if model wraps JSON in ```json
    content = response.content.strip()
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]

    try:
        return json.loads(content.strip())
    except Exception:
        return {"raw_text": response.content}


def print_human_readable_items(result: dict):
    """Prints extracted items in a clear, human-readable table format."""
    if "error" in result:
        print(f"Error: {result['error']}")
        return

    items = result.get("items", [])
    if not items:
        print("No items detected or raw text:", result.get("raw_text", ""))
        return

    print("\n" + "=" * 70)
    print(f"{'#':<4} | {'Item Name (English)':<25} | {'Marathi Name':<18} | {'Qty & Unit':<12}")
    print("=" * 70)
    for idx, item in enumerate(items, 1):
        eng = item.get("item_name_english", item.get("item_name", "N/A"))
        mar = item.get("item_name_marathi", "-")
        qty = item.get("quantity", "")
        unit = item.get("unit", "")
        qty_str = f"{qty} {unit}".strip()
        print(f"{idx:<4} | {eng:<25} | {mar:<18} | {qty_str:<12}")
    print("=" * 70)


if __name__ == "__main__":
    import sys
    if sys.stdout.encoding != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except AttributeError:
            pass

    # Test with sample image
    extracted = extract_items_from_image("sample.jpeg")
    print("\n--- Extracted JSON ---")
    print(json.dumps(extracted, ensure_ascii=False, indent=2))

    print("\n--- Human-Readable Table ---")
    print_human_readable_items(extracted)
    
