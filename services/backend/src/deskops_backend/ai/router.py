import time

from deskops_backend.ai.providers.base import AiProvider


class AiRouter:
    def __init__(
        self,
        provider: AiProvider,
        *,
        model_id: str,
        max_tokens: int,
        temperature: float,
        timeout_seconds: int,
    ):
        self.provider = provider
        self.model_id = model_id
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.timeout_seconds = timeout_seconds

    def generate(self, prompt: str) -> dict:
        started_at = time.perf_counter()
        text_output, usage = self.provider.generate(
            model_id=self.model_id,
            prompt=prompt,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            timeout_seconds=self.timeout_seconds,
        )
        latency_ms = int((time.perf_counter() - started_at) * 1000)
        return {
            "text_output": text_output,
            "usage": usage,
            "latency_ms": latency_ms,
            "model_id": self.model_id,
        }
