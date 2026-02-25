from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from deskops_backend.application.container import container

router = APIRouter()


class AiRequest(BaseModel):
    metadata: dict[str, Any] = Field(default_factory=dict)


@router.post("/v1/ai/summarize")
def summarize(payload: AiRequest) -> dict:
    try:
        return container.ai_service.run("summarize", payload.metadata)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/v1/ai/opportunities")
def opportunities(payload: AiRequest) -> dict:
    try:
        return container.ai_service.run("opportunities", payload.metadata)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/v1/ai/design")
def design(payload: AiRequest) -> dict:
    try:
        return container.ai_service.run("design", payload.metadata)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/v1/ai/runs")
def list_ai_runs() -> dict:
    return {"runs": container.ai_service.list_runs()}
