from fastapi import APIRouter, Depends, UploadFile, File, Form
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
import os
import base64
import json
from PIL import Image, ImageOps, ImageEnhance
import io
from auth import require_user

load_dotenv()
router = APIRouter()

vision_llm = ChatOpenAI(
    model="google/gemini-2.5-flash",
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    max_tokens=500
)

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "ta": "Tamil",
    "bn": "Bengali",
    "te": "Telugu",
}


def preprocess_image(image_bytes: bytes) -> bytes:
    image = Image.open(io.BytesIO(image_bytes)).convert("L")  # grayscale
    image = ImageOps.autocontrast(image)                       # normalize contrast
    image = ImageEnhance.Sharpness(image).enhance(2.0)          # sharpen handwriting edges

    max_dim = max(image.size)
    if max_dim < 1500:  # upscale small/low-res photos
        scale = 1500 / max_dim
        image = image.resize((int(image.width * scale), int(image.height * scale)), Image.LANCZOS)

    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()

@router.post("/ocr/extract")
async def extract_items(
    file: UploadFile = File(...),
    language: str = Form("en"),
    _current_user: dict = Depends(require_user),
):
    language = language.lower()
    language_name = LANGUAGE_NAMES.get(language, "English")
    image_bytes = await file.read()
    processed_bytes = preprocess_image(image_bytes)
    base64_image = base64.b64encode(processed_bytes).decode("utf-8")
    data_url = f"data:image/png;base64,{base64_image}"

    vision_prompt = f"""Extract every grocery item and quantity from the image.
The source may be handwritten or printed in English, Hindi, Marathi, Tamil,
Bengali, Telugu, or a mixture of these languages.

Return each item with two names:
- "name": the canonical English product name for matching inventory.
- "display_name": the same product name translated into {language_name} for
    the shopkeeper to read. Preserve familiar brand names; transliterate them
    when that is more natural than translating.
- "quantity": a number.
- "unit": a short unit such as kg, g, litre, packet, or piece when present.

Do not omit items or change their quantities. Return ONLY a JSON list, for
example: [{{"name":"Rice","display_name":"तांदूळ","quantity":2,"unit":"kg"}}]."""

    message = HumanMessage(content=[
        {"type": "text", "text": vision_prompt},
        {"type": "image_url", "image_url": {"url": data_url}},
    ])

    response = vision_llm.invoke([message])

    cleaned = response.content.strip().replace("```json", "").replace("```", "")

    try:
        items = json.loads(cleaned)
        if not isinstance(items, list):
            return {"items": [], "error": "Could not parse items from image", "raw": cleaned}
        items = [
            {
                **item,
                "display_name": item.get("display_name") or item.get("name", ""),
            }
            for item in items
            if isinstance(item, dict)
        ]
    except json.JSONDecodeError:
        return {"items": [], "error": "Could not parse items from image", "raw": cleaned}

    return {"items": items}