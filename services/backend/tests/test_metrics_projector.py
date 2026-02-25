import pathlib
import sys
import unittest
from datetime import datetime, timezone

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from deskops_backend.application.metrics_projector import MetricsProjector
from deskops_backend.infrastructure.db.base import Base
from deskops_backend.infrastructure.db.repositories import PostgresMetricsSnapshotRepository
from deskops_backend.infrastructure.db.tables import MetricsSnapshotRow, OutboxJobRow
from deskops_backend.infrastructure.outbox.worker import PostgresOutboxWorker


class MetricsProjectorTest(unittest.TestCase):
    def test_worker_projects_outbox_event_into_snapshot(self):
        engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
        Base.metadata.create_all(engine)
        session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)

        with session_factory.begin() as session:
            session.add(
                OutboxJobRow(
                    job_type="metrics.aggregate",
                    dedupe_key="metrics.aggregate:evt_55",
                    payload_json='{"job_type":"metrics.aggregate","event_id":"evt_55","occurred_at":"2026-02-23T10:15:00Z","result":"success"}',
                    status="pending",
                    created_at=datetime.now(timezone.utc),
                )
            )

        snapshot_repo = PostgresMetricsSnapshotRepository(session_factory=session_factory)
        projector = MetricsProjector(snapshot_repo)
        worker = PostgresOutboxWorker(session_factory=session_factory, job_handler=projector.handle_outbox_job)
        processed = worker.poll_once(limit=20)
        self.assertEqual(processed, 1)

        with session_factory() as session:
            row = session.scalar(select(MetricsSnapshotRow))
            self.assertIsNotNone(row)
            self.assertEqual(row.bucket_day, "2026-02-23")
            self.assertEqual(row.success_count, 1)


if __name__ == "__main__":
    unittest.main()
