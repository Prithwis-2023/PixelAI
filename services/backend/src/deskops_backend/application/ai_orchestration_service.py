from deskops_backend.ai.agents.designer_agent import DesignerAgent
from deskops_backend.ai.agents.opportunity_agent import OpportunityAgent
from deskops_backend.ai.agents.summarizer_agent import SummarizerAgent


ALLOWED_METADATA_KEYS = {
    "day",
    "observed_minutes",
    "event_count",
    "work_categories",
    "repetitive_patterns",
    "app_usage",
    "url_domains",
    "candidate_context",
    "selected_candidate",
    "guard_context",
}


class AiOrchestrationService:
    def __init__(self, router, ai_repository, *, metadata_only: bool = True):
        self.router = router
        self.ai_repository = ai_repository
        self.metadata_only = metadata_only
        self._agents = {
            "summarize": SummarizerAgent(),
            "opportunities": OpportunityAgent(),
            "design": DesignerAgent(),
        }

    def _sanitize_metadata(self, metadata: dict) -> dict:
        if not self.metadata_only:
            return metadata
        return {k: v for k, v in metadata.items() if k in ALLOWED_METADATA_KEYS}

    def run(self, task: str, metadata: dict) -> dict:
        if task not in self._agents:
            raise ValueError(f"unsupported_task:{task}")

        agent = self._agents[task]
        sanitized = self._sanitize_metadata(metadata)
        self.ai_repository.save_prompt_version(
            task=task,
            version=agent.prompt_version,
            content=agent.prompt_content(),
        )
        prompt = agent.build_prompt(sanitized)

        status = "ok"
        schema_valid = True
        fallback_used = False
        error_message = None
        usage = None
        latency_ms = 0

        try:
            routed = self.router.generate(prompt)
            usage = routed.get("usage")
            latency_ms = int(routed.get("latency_ms", 0))
            output_payload = agent.parse_output(routed.get("text_output", ""))
        except Exception as exc:  # noqa: BLE001
            fallback_used = True
            schema_valid = False
            status = "fallback"
            error_message = str(exc)
            output_payload = agent.fallback(sanitized, error_message)

        run_id = self.ai_repository.create_run(
            task=task,
            provider=self.router.provider.__class__.__name__,
            model_id=self.router.model_id,
            status=status,
            latency_ms=latency_ms,
            error_message=error_message,
            input_metadata=sanitized,
            usage=usage,
        )
        self.ai_repository.save_output(
            run_id=run_id,
            task=task,
            prompt_version=agent.prompt_version,
            schema_valid=schema_valid,
            fallback_used=fallback_used,
            output_payload=output_payload,
        )

        return {
            "run_id": run_id,
            "task": task,
            "status": status,
            "schema_valid": schema_valid,
            "fallback_used": fallback_used,
            "output": output_payload,
        }

    def list_runs(self) -> list[dict]:
        return self.ai_repository.list_runs()
