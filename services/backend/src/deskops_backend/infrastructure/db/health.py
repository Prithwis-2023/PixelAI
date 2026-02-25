from sqlalchemy import inspect, text


REQUIRED_TABLES = (
    "telemetry_events",
    "audit_logs",
    "outbox_jobs",
    "metrics_snapshots",
    "ai_runs",
    "ai_outputs",
    "prompt_versions",
)


def check_database_connection(session_factory=None) -> tuple[bool, str | None]:
    try:
        if session_factory is None:
            from deskops_backend.infrastructure.db.session import SessionLocal

            session_factory = SessionLocal
        with session_factory() as session:
            session.execute(text("SELECT 1"))
        return True, None
    except Exception as exc:  # noqa: BLE001
        return False, str(exc)


def check_required_tables(session_factory=None) -> dict[str, bool]:
    if session_factory is None:
        from deskops_backend.infrastructure.db.session import SessionLocal

        session_factory = SessionLocal
    with session_factory() as session:
        inspector = inspect(session.get_bind())
        return {name: inspector.has_table(name) for name in REQUIRED_TABLES}
