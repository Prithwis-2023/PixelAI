import pathlib
import sys
import unittest

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from deskops_backend.application.telemetry_service import TelemetryService
from deskops_backend.infrastructure.audit.audit_repository import InMemoryAuditRepository
from deskops_backend.infrastructure.db.repositories import DuplicateIngestError, InMemoryTelemetryRepository
from deskops_backend.infrastructure.outbox.publisher import InMemoryOutboxPublisher


class TelemetryServiceTest(unittest.TestCase):
    def setUp(self):
        self.service = TelemetryService(
            telemetry_repository=InMemoryTelemetryRepository(),
            audit_repository=InMemoryAuditRepository(),
            outbox_publisher=InMemoryOutboxPublisher(),
        )

    def test_accepts_valid_event(self):
        status, payload = self.service.ingest(
            {
                "eventId": "evt_100",
                "occurredAt": "2026-02-23T10:00:00Z",
                "category": "crm_data_entry",
                "result": "success",
            }
        )
        self.assertEqual(status, 202)
        self.assertTrue(payload["accepted"])

    def test_rejects_invalid_result(self):
        status, payload = self.service.ingest(
            {
                "eventId": "evt_101",
                "occurredAt": "2026-02-23T10:00:00Z",
                "category": "crm_data_entry",
                "result": "unknown",
            }
        )
        self.assertEqual(status, 400)
        self.assertEqual(payload["error"], "invalid_result")

    def test_returns_409_when_ingest_is_duplicate(self):
        class DuplicateWriter:
            def save_ingest_bundle(self, event, audit, outbox_job):
                raise DuplicateIngestError("duplicate")

        service = TelemetryService(
            telemetry_repository=InMemoryTelemetryRepository(),
            audit_repository=InMemoryAuditRepository(),
            outbox_publisher=InMemoryOutboxPublisher(),
            ingest_bundle_writer=DuplicateWriter(),
        )
        status, payload = service.ingest(
            {
                "eventId": "evt_200",
                "occurredAt": "2026-02-23T10:00:00Z",
                "category": "crm_data_entry",
                "result": "success",
            }
        )
        self.assertEqual(status, 409)
        self.assertEqual(payload["error"], "duplicate_ingest")


if __name__ == "__main__":
    unittest.main()
