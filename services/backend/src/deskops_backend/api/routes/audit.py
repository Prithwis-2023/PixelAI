from fastapi import APIRouter

from deskops_backend.application.container import container

router = APIRouter()


@router.get("/v1/audit/logs")
def audit_logs() -> dict:
    records = container.audit_repository.list()
    return {
        "records": [
            {
                "actor": r.actor,
                "action": r.action,
                "target": r.target,
                "result": r.result,
                "timestamp": r.timestamp,
            }
            for r in records
        ]
    }
