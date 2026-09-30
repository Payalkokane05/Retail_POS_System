import json
import os

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from auth import require_user
from database.mongodb import db

router = APIRouter()

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "ta": "Tamil",
    "bn": "Bengali",
    "te": "Telugu",
}

NAME_KINDS = {
    "product": "product or grocery item name",
    "person": "person's proper name",
    "shop": "shop or brand name",
}

localization_llm = ChatOpenAI(
    model="google/gemini-2.5-flash",
    max_tokens=1500,
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
)


class LocalizeNamesRequest(BaseModel):
    language: str
    kind: str
    names: list[str] = Field(max_length=100)


def _generate_translations(names: list[str], kind: str, language_name: str) -> dict[str, str]:
    translations = {}
    for offset in range(0, len(names), 30):
        chunk = names[offset:offset + 30]
        prompt_names = [
            {"id": str(index), "name": name}
            for index, name in enumerate(chunk)
        ]
        prompt = (
            f"Render each {NAME_KINDS[kind]} for display in {language_name}. "
            "For products, translate the meaning naturally and preserve brand names. "
            "For person and shop names, transliterate the pronunciation into the "
            "native script; do not translate or change the identity. "
            "Return only JSON with this shape: "
            '{"translations":[{"id":"0","name":"localized name"}]}. '
            f"Input: {json.dumps(prompt_names, ensure_ascii=False)}"
        )
        response = localization_llm.invoke([
            SystemMessage(content="You localize names accurately and preserve their identity."),
            HumanMessage(content=prompt),
        ])
        content = response.content.strip()
        if "```json" in content:
            content = content.split("```json", 1)[1].split("```", 1)[0]
        elif "```" in content:
            content = content.split("```", 1)[1].split("```", 1)[0]

        data = json.loads(content)
        for item in data.get("translations", []):
            try:
                index = int(item["id"])
                localized_name = str(item["name"]).strip()
            except (KeyError, TypeError, ValueError):
                continue
            if 0 <= index < len(chunk) and localized_name:
                translations[chunk[index]] = localized_name
    return translations


@router.post("/localization/names")
def localize_names(
    request: LocalizeNamesRequest,
    _current_user: dict = Depends(require_user),
):
    language = request.language.lower()
    kind = request.kind.lower()
    if language not in LANGUAGE_NAMES:
        return {"translations": {name: name for name in request.names}}
    if kind not in NAME_KINDS:
        return {"translations": {name: name for name in request.names}}

    names = list(dict.fromkeys(name.strip() for name in request.names if name.strip()))
    if language == "en" or not names:
        return {"translations": {name: name for name in names}}

    collection = db["localized_names"]
    translations = {}
    missing = []
    for name in names:
        cached = collection.find_one(
            {"source_name": name, "language": language, "kind": kind},
            {"display_name": 1},
        )
        if cached and cached.get("display_name"):
            translations[name] = cached["display_name"]
        else:
            missing.append(name)

    if missing:
        try:
            generated = _generate_translations(missing, kind, LANGUAGE_NAMES[language])
        except Exception:
            generated = {}

        for name in missing:
            display_name = generated.get(name, name)
            translations[name] = display_name
            if name in generated:
                collection.update_one(
                    {"source_name": name, "language": language, "kind": kind},
                    {"$set": {"display_name": display_name}},
                    upsert=True,
                )

    return {"translations": translations}