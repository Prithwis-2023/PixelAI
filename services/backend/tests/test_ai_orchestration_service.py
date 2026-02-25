import pathlib
import sys
import unittest

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from deskops_backend.application.ai_orchestration_service import AiOrchestrationService
from deskops_backend.infrastructure.db.ai_repositories import InMemoryAiRepository


class FakeRouter:
    def __init__(self, text_output: str):
        self.text_output = text_output
        self.model_id = "amazon.nova-lite-v1:0"
        self.provider = type("P", (), {})()

    def generate(self, prompt: str):
        self.last_prompt = prompt
        return {"text_output": self.text_output, "usage": {"outputTokens": 8}, "latency_ms": 5, "model_id": self.model_id}


class AiOrchestrationServiceTest(unittest.TestCase):
    def test_fallback_on_invalid_model_payload(self):
        service = AiOrchestrationService(
            router=FakeRouter(text_output="not-json"),
            ai_repository=InMemoryAiRepository(),
            metadata_only=True,
        )
        result = service.run("summarize", {"raw_text": "secret", "event_count": 12})
        self.assertEqual(result["status"], "fallback")
        self.assertFalse(result["schema_valid"])

    def test_metadata_only_strips_non_allowlist(self):
        router = FakeRouter(
            text_output='{"day_summary":"ok","work_categories":[{"name":"crm","duration_minutes":10,"frequency":2}],"repetitive_patterns":[]}'
        )
        service = AiOrchestrationService(router=router, ai_repository=InMemoryAiRepository(), metadata_only=True)
        result = service.run("summarize", {"raw_text": "secret", "event_count": 12})
        self.assertEqual(result["status"], "ok")
        self.assertNotIn("raw_text", router.last_prompt)

    def test_run_persists_prompt_version_and_run_log(self):
        repo = InMemoryAiRepository()
        router = FakeRouter(
            text_output='{"day_summary":"ok","work_categories":[{"name":"crm","duration_minutes":10,"frequency":2}],"repetitive_patterns":[]}'
        )
        service = AiOrchestrationService(router=router, ai_repository=repo, metadata_only=True)
        service.run("summarize", {"event_count": 12})

        runs = service.list_runs()
        self.assertEqual(len(runs), 1)
        prompt_versions = repo.list_prompt_versions()
        self.assertEqual(len(prompt_versions), 1)
        self.assertEqual(prompt_versions[0]["version"], "summarizer_v1")


if __name__ == "__main__":
    unittest.main()
