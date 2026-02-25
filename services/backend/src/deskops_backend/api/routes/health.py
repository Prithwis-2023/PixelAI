from fastapi import APIRouter, Request

from deskops_backend.application.container import container
from deskops_backend.infrastructure.db.health import check_database_connection, check_required_tables
from deskops_backend.settings import settings

router = APIRouter()


@router.get("/health")
def health(request: Request) -> dict:
    daemon = getattr(request.app.state, "outbox_daemon", None)
    startup_checks = getattr(request.app.state, "startup_checks", {})
    payload = {
        "ok": True,
        "mode": "in_memory" if settings.use_in_memory_repositories else "postgres",
        "outbox_worker_enabled": container.outbox_enabled,
        "outbox_daemon_enabled": settings.enable_outbox_daemon,
        "outbox_daemon_running": bool(daemon is not None and daemon.is_running),
        "ai": {
            "provider": settings.ai_provider,
            "model_id": settings.ai_model_id,
            "metadata_only": settings.ai_metadata_only,
            "provider_ready": bool(getattr(container.ai_router.provider, "is_ready", True)),
            "provider_init_error": getattr(container.ai_router.provider, "init_error", None),
        },
        "startup_checks": startup_checks,
    }
    if not settings.use_in_memory_repositories:
        db_ok, db_error = check_database_connection()
        payload["database"] = {
            "ok": db_ok,
            "error": db_error,
            "required_tables": check_required_tables() if db_ok else None,
        }
        if not db_ok:
            payload["ok"] = False
    return payload
