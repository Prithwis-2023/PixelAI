from deskops_backend.domain.models import TelemetryEvent, is_valid_iso8601


def validate_telemetry_event(event: TelemetryEvent) -> tuple[bool, str | None]:
    if not event.event_id.strip():
        return False, "missing_or_invalid_event_id"
    if not event.category.strip():
        return False, "missing_or_invalid_category"
    if event.result not in {"success", "failed", "review"}:
        return False, "invalid_result"
    if not is_valid_iso8601(event.occurred_at):
        return False, "invalid_occurred_at"
    return True, None
