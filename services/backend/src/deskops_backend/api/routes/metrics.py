from fastapi import APIRouter, HTTPException

from deskops_backend.application.container import container

router = APIRouter()


@router.get("/v1/metrics/summary")
def metrics_summary(from_ts: str | None = None, to_ts: str | None = None) -> dict:
    return container.metrics_service.summary(from_ts=from_ts, to_ts=to_ts)


@router.post("/v1/metrics/outbox/poll")
def outbox_poll(limit: int = 100, max_attempts: int = 3) -> dict:
    if container.outbox_worker is None:
        raise HTTPException(status_code=400, detail="outbox_worker_not_enabled")
    processed = container.outbox_worker.poll_once(limit=limit, max_attempts=max_attempts)
    return {"processed_jobs": processed}
