from deskops_backend.domain.metrics_calculator import calculate_summary


class MetricsService:
    def __init__(self, telemetry_repository, snapshot_repository=None):
        self.telemetry_repository = telemetry_repository
        self.snapshot_repository = snapshot_repository

    def summary(self, from_ts: str | None = None, to_ts: str | None = None) -> dict:
        if self.snapshot_repository is not None:
            snapshot = self.snapshot_repository.latest_summary(from_ts=from_ts, to_ts=to_ts)
            if snapshot is not None:
                return snapshot
        events = self.telemetry_repository.list(from_ts=from_ts, to_ts=to_ts)
        return calculate_summary(events)
