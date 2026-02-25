import json
from datetime import datetime, timedelta, timezone

from sqlalchemy import or_, select

from deskops_backend.infrastructure.db.tables import OutboxJobRow


class OutboxWorker:
    def __init__(self, publisher):
        self.publisher = publisher
        self.processed: list[dict] = []

    def poll_once(self) -> int:
        jobs = self.publisher.list()
        new_jobs = [job for job in jobs if job not in self.processed]
        self.processed.extend(new_jobs)
        return len(new_jobs)


class PostgresOutboxWorker:
    def __init__(self, session_factory=None, job_handler=None, retry_delay_seconds: int = 30):
        self._session_factory = session_factory
        self.job_handler = job_handler
        self.retry_delay_seconds = retry_delay_seconds

    def _get_session_factory(self):
        if self._session_factory is not None:
            return self._session_factory
        from deskops_backend.infrastructure.db.session import SessionLocal

        return SessionLocal

    def _default_handler(self, job: OutboxJobRow, payload: dict, session) -> None:
        return None

    def poll_once(self, limit: int = 100, max_attempts: int = 3) -> int:
        SessionFactory = self._get_session_factory()
        now = datetime.now(timezone.utc)
        handler = self.job_handler or self._default_handler

        with SessionFactory.begin() as session:
            jobs = session.scalars(
                select(OutboxJobRow)
                .where(
                    or_(
                        OutboxJobRow.status == "pending",
                        (OutboxJobRow.status == "retry") & (OutboxJobRow.next_retry_at <= now),
                    )
                )
                .order_by(OutboxJobRow.id.asc())
                .limit(limit)
            ).all()

            for job in jobs:
                try:
                    payload = json.loads(job.payload_json)
                    handler(job, payload, session)
                    job.status = "processed"
                    job.processed_at = now
                    job.last_error = None
                except Exception as exc:
                    job.attempts += 1
                    job.last_error = str(exc)
                    if job.attempts >= max_attempts:
                        job.status = "failed"
                    else:
                        job.status = "retry"
                        job.next_retry_at = now + timedelta(seconds=self.retry_delay_seconds)
        return len(jobs)
