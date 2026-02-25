from datetime import datetime, timezone

from deskops_backend.domain.models import AuditRecord, TelemetryEvent
from deskops_backend.domain.telemetry_schema import validate_telemetry_event
from deskops_backend.infrastructure.db.repositories import DuplicateIngestError


class TelemetryService:
    def __init__(self, telemetry_repository, audit_repository, outbox_publisher, ingest_bundle_writer=None):
        self.telemetry_repository = telemetry_repository
        self.audit_repository = audit_repository
        self.outbox_publisher = outbox_publisher
        self.ingest_bundle_writer = ingest_bundle_writer

    def ingest(self, payload: dict) -> tuple[int, dict]:
        event = TelemetryEvent(
            event_id=str(payload.get("eventId", "")),
            occurred_at=str(payload.get("occurredAt", "")),
            category=str(payload.get("category", "")),
            result=str(payload.get("result", "")),
            source=str(payload.get("source", "desktop-agent")),
        )

        valid, reason = validate_telemetry_event(event)
        if not valid:
            return 400, {"error": reason}

        audit_record = AuditRecord(
            actor="backend-api",
            action="telemetry_ingested",
            target=event.event_id,
            result="success",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        outbox_job = {
            "job_type": "metrics.aggregate",
            "event_id": event.event_id,
            "occurred_at": event.occurred_at,
            "category": event.category,
            "result": event.result,
        }

        if self.ingest_bundle_writer is not None:
            try:
                self.ingest_bundle_writer.save_ingest_bundle(event, audit_record, outbox_job)
            except DuplicateIngestError:
                return 409, {"error": "duplicate_ingest"}
        else:
            self.telemetry_repository.save(event)
            self.outbox_publisher.publish(outbox_job)
            self.audit_repository.append(audit_record)
        return 202, {"accepted": True}
