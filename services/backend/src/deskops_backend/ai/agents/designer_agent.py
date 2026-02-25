import json

from deskops_backend.ai.agents.utils import extract_json_object, load_prompt_file
from deskops_backend.ai.schemas.designer_output import DesignerOutput


class DesignerAgent:
    task = "design"
    prompt_version = "designer_v1"
    prompt_file = "designer_v1.md"

    def build_prompt(self, metadata: dict) -> str:
        prompt = load_prompt_file(self.prompt_file)
        return f"{prompt}\n\nMETADATA_JSON:\n{json.dumps(metadata, ensure_ascii=True)}"

    def prompt_content(self) -> str:
        return load_prompt_file(self.prompt_file)

    def parse_output(self, raw_text: str) -> dict:
        parsed = extract_json_object(raw_text)
        return DesignerOutput.model_validate(parsed).model_dump()

    def fallback(self, metadata: dict, reason: str) -> dict:
        workflow_name = str(metadata.get("workflow_name", "fallback_workflow"))
        return DesignerOutput(
            workflow_name=workflow_name,
            steps=[
                {
                    "step_id": "s1",
                    "action": "human_review",
                    "target": "candidate_payload",
                }
            ],
            exception_paths=["fallback_route"],
            rollback={"strategy": f"manual_rollback ({reason})", "checkpoints": ["before_submit"]},
        ).model_dump()
