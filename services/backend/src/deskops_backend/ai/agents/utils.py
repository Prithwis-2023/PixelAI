import json
from pathlib import Path


def load_prompt_file(filename: str) -> str:
    prompt_dir = Path(__file__).resolve().parents[1] / "prompts"
    return (prompt_dir / filename).read_text(encoding="utf-8")


def extract_json_object(text: str) -> dict:
    raw = text.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.startswith("json"):
            raw = raw[4:].strip()
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("json_object_not_found")
    return json.loads(raw[start : end + 1])
