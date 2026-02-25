class MetricsProjector:
    def __init__(self, snapshot_repository):
        self.snapshot_repository = snapshot_repository

    def handle_outbox_job(self, job, payload: dict, session) -> None:
        if payload.get("job_type") != "metrics.aggregate":
            return
        occurred_at = str(payload.get("occurred_at", ""))
        result = str(payload.get("result", ""))
        bucket_day = occurred_at[:10]
        if len(bucket_day) != 10 or not result:
            raise ValueError("invalid_metrics_payload")
        self.snapshot_repository.increment_event(bucket_day=bucket_day, result=result, session=session)
