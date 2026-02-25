import pathlib
import sys
import unittest

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from deskops_backend.application.metrics_service import MetricsService
from deskops_backend.domain.models import TelemetryEvent
from deskops_backend.infrastructure.db.repositories import (
    InMemoryMetricsSnapshotRepository,
    InMemoryTelemetryRepository,
)


class MetricsServiceTest(unittest.TestCase):
    def test_summary_counts(self):
        repo = InMemoryTelemetryRepository()
        repo.save(
            TelemetryEvent(
                event_id="evt_1",
                occurred_at="2026-02-23T09:00:00Z",
                category="crm_data_entry",
                result="success",
            )
        )
        repo.save(
            TelemetryEvent(
                event_id="evt_2",
                occurred_at="2026-02-23T09:30:00Z",
                category="crm_data_entry",
                result="failed",
            )
        )
        repo.save(
            TelemetryEvent(
                event_id="evt_3",
                occurred_at="2026-02-23T10:00:00Z",
                category="lead_sync",
                result="review",
            )
        )
        service = MetricsService(repo)
        summary = service.summary()
        self.assertEqual(summary["total_events"], 3)
        self.assertEqual(summary["success_count"], 1)
        self.assertEqual(summary["failed_count"], 1)
        self.assertEqual(summary["review_count"], 1)
        self.assertEqual(summary["by_category"]["crm_data_entry"], 2)

    def test_summary_uses_snapshot_when_available(self):
        repo = InMemoryTelemetryRepository()
        snapshot_repo = InMemoryMetricsSnapshotRepository()
        snapshot_repo.increment_event("2026-02-23", "success")
        snapshot_repo.increment_event("2026-02-23", "failed")
        snapshot_repo.increment_event("2026-02-23", "review")
        snapshot_repo.increment_event("2026-02-24", "success")
        service = MetricsService(repo, snapshot_repository=snapshot_repo)

        summary = service.summary(from_ts="2026-02-23T00:00:00Z", to_ts="2026-02-24T23:59:59Z")
        self.assertEqual(summary["total_events"], 4)
        self.assertEqual(summary["success_count"], 2)
        self.assertEqual(summary["failed_count"], 1)
        self.assertEqual(summary["review_count"], 1)
        self.assertEqual(summary["bucket_day"], "2026-02-24")


if __name__ == "__main__":
    unittest.main()
