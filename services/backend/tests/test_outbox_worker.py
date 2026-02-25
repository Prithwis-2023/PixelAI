import pathlib
import sys
import unittest
from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from deskops_backend.infrastructure.db.base import Base
from deskops_backend.infrastructure.db.tables import OutboxJobRow
from deskops_backend.infrastructure.outbox.worker import PostgresOutboxWorker


class PostgresOutboxWorkerTest(unittest.TestCase):
    def setUp(self):
        engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
        Base.metadata.create_all(engine)
        self.session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)

        with self.session_factory.begin() as session:
            session.add(
                OutboxJobRow(
                    job_type="metrics.aggregate",
                    dedupe_key="metrics.aggregate:evt_1",
                    payload_json='{"job_type":"metrics.aggregate","event_id":"evt_1","occurred_at":"2026-02-23T09:00:00Z","result":"success"}',
                    status="pending",
                    created_at=datetime.now(timezone.utc),
                )
            )

    def test_poll_once_marks_jobs_processed(self):
        worker = PostgresOutboxWorker(session_factory=self.session_factory)
        processed = worker.poll_once(limit=10)
        self.assertEqual(processed, 1)

        with self.session_factory() as session:
            jobs = session.query(OutboxJobRow).all()
            self.assertEqual(jobs[0].status, "processed")
            self.assertIsNotNone(jobs[0].processed_at)

    def test_poll_once_marks_retry_on_handler_error(self):
        def failing_handler(job, payload, session):
            raise ValueError("boom")

        worker = PostgresOutboxWorker(session_factory=self.session_factory, job_handler=failing_handler)
        worker.poll_once(limit=10, max_attempts=3)

        with self.session_factory() as session:
            job = session.query(OutboxJobRow).one()
            self.assertEqual(job.status, "retry")
            self.assertEqual(job.attempts, 1)
            self.assertEqual(job.last_error, "boom")
            self.assertIsNotNone(job.next_retry_at)

    def test_poll_once_marks_failed_after_max_attempts(self):
        def failing_handler(job, payload, session):
            raise ValueError("still-failing")

        worker = PostgresOutboxWorker(session_factory=self.session_factory, job_handler=failing_handler)
        worker.poll_once(limit=10, max_attempts=1)

        with self.session_factory() as session:
            job = session.query(OutboxJobRow).one()
            self.assertEqual(job.status, "failed")
            self.assertEqual(job.attempts, 1)
            self.assertEqual(job.last_error, "still-failing")


if __name__ == "__main__":
    unittest.main()
