from contextlib import asynccontextmanager

from fastapi import FastAPI

from deskops_backend.application.container import container
from deskops_backend.api.routes.ai import router as ai_router
from deskops_backend.api.routes.audit import router as audit_router
from deskops_backend.api.routes.health import router as health_router
from deskops_backend.api.routes.metrics import router as metrics_router
from deskops_backend.api.routes.telemetry import router as telemetry_router
from deskops_backend.infrastructure.db.health import check_database_connection
from deskops_backend.settings import settings
from deskops_backend.workers.outbox_daemon import OutboxDaemon


@asynccontextmanager
async def lifespan(app: FastAPI):
    daemon = None
    provider_ready = bool(getattr(container.ai_router.provider, "is_ready", True))
    provider_error = getattr(container.ai_router.provider, "init_error", None)
    app.state.startup_checks = {
        "database": {"checked": False, "ok": None, "error": None},
        "ai_provider": {"checked": True, "ok": provider_ready, "error": provider_error},
    }
    if (not provider_ready) and settings.ai_startup_fail_fast:
        raise RuntimeError(f"ai provider startup check failed: {provider_error}")
    if not settings.use_in_memory_repositories and settings.db_startup_check_enabled:
        ok, error = check_database_connection()
        app.state.startup_checks["database"] = {"checked": True, "ok": ok, "error": error}
        if (not ok) and settings.db_startup_fail_fast:
            raise RuntimeError(f"database startup check failed: {error}")
    if settings.enable_outbox_daemon and container.outbox_enabled:
        daemon = OutboxDaemon(
            worker=container.outbox_worker,
            poll_interval_seconds=settings.outbox_poll_interval_seconds,
            poll_limit=settings.outbox_poll_limit,
            max_attempts=settings.outbox_max_attempts,
        )
        daemon.start()
    app.state.outbox_daemon = daemon
    try:
        yield
    finally:
        if daemon is not None:
            daemon.stop()


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.include_router(health_router)
app.include_router(ai_router)
app.include_router(telemetry_router)
app.include_router(metrics_router)
app.include_router(audit_router)
