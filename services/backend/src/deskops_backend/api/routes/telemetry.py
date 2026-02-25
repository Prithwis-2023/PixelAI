from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from deskops_backend.application.container import container

router = APIRouter()


class TelemetryPayload(BaseModel):
    eventId: str
    occurredAt: str
    category: str
    result: str
    source: str | None = "desktop-agent"


@router.post("/v1/telemetry/events", status_code=202)
def ingest(payload: TelemetryPayload) -> dict:
    status, data = container.telemetry_service.ingest(payload.model_dump())
    if status >= 400:
        raise HTTPException(status_code=status, detail=data["error"])
    return data
