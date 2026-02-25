from typing import Protocol


class AiProvider(Protocol):
    def generate(
        self,
        *,
        model_id: str,
        prompt: str,
        max_tokens: int,
        temperature: float,
        timeout_seconds: int,
    ) -> tuple[str, dict]:
        ...
