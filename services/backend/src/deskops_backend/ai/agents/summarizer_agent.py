import json

from deskops_backend.ai.agents.utils import extract_json_object, load_prompt_file
from deskops_backend.ai.schemas.summarizer_output import SummarizerOutput


class SummarizerAgent:
    task = "summarize"
    prompt_version = "summarizer_v1"
    prompt_file = "summarizer_v1.md"

    def build_prompt(self, metadata: dict) -> str:
        prompt = load_prompt_file(self.prompt_file)
        return f"{prompt}\n\nMETADATA_JSON:\n{json.dumps(metadata, ensure_ascii=True)}"

    def prompt_content(self) -> str:
        return load_prompt_file(self.prompt_file)

    def parse_output(self, raw_text: str) -> dict:
        parsed = extract_json_object(raw_text)
        return SummarizerOutput.model_validate(parsed).model_dump()

    def fallback(self, metadata: dict, reason: str) -> dict:
        return SummarizerOutput(
            day_summary=f"Fallback summary generated ({reason}).",
            work_categories=[
                {
                    "name": "unknown",
                    "duration_minutes": int(metadata.get("observed_minutes", 0) or 0),
                    "frequency": int(metadata.get("event_count", 0) or 0),
                }
            ],
            repetitive_patterns=[],
        ).model_dump()
