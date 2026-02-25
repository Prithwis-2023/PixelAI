import json

from deskops_backend.ai.agents.utils import extract_json_object, load_prompt_file
from deskops_backend.ai.schemas.opportunity_output import OpportunityOutput


class OpportunityAgent:
    task = "opportunities"
    prompt_version = "opportunity_v1"
    prompt_file = "opportunity_v1.md"

    def build_prompt(self, metadata: dict) -> str:
        prompt = load_prompt_file(self.prompt_file)
        return f"{prompt}\n\nMETADATA_JSON:\n{json.dumps(metadata, ensure_ascii=True)}"

    def prompt_content(self) -> str:
        return load_prompt_file(self.prompt_file)

    def parse_output(self, raw_text: str) -> dict:
        parsed = extract_json_object(raw_text)
        return OpportunityOutput.model_validate(parsed).model_dump()

    def fallback(self, metadata: dict, reason: str) -> dict:
        return OpportunityOutput(
            candidates=[
                {
                    "candidate_id": "fallback_candidate_01",
                    "name": "Manual review required",
                    "success_probability": 0.5,
                    "risk_score": 0.5,
                    "normalized_time_saved": 0.2,
                    "score": 0.44,
                    "reason": f"Fallback opportunity generated ({reason}).",
                }
            ]
        ).model_dump()
