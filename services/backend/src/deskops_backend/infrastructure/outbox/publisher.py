class InMemoryOutboxPublisher:
    def __init__(self):
        self._jobs: list[dict] = []

    def publish(self, job: dict) -> None:
        self._jobs.append(job)

    def list(self) -> list[dict]:
        return list(self._jobs)
