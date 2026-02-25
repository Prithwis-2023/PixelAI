import json
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from deskops_backend.domain.models import AuditRecord, TelemetryEvent
from deskops_backend.infrastructure.db.tables import (
    AuditLogRow,
    MetricsSnapshotRow,
    OutboxJobRow,
    TelemetryEventRow,
)


def _parse_iso(ts: str) -> datetime:
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


class DuplicateIngestError(Exception):
    pass


class InMemoryTelemetryRepository:
    def __init__(self):
        self._events: list[TelemetryEvent] = []

    def save(self, event: TelemetryEvent) -> None:
        self._events.append(event)

    def list(self, from_ts: str | None = None, to_ts: str | None = None) -> list[TelemetryEvent]:
        output = self._events
        if from_ts:
            start = _parse_iso(from_ts)
            output = [event for event in output if _parse_iso(event.occurred_at) >= start]
        if to_ts:
            end = _parse_iso(to_ts)
            output = [event for event in output if _parse_iso(event.occurred_at) <= end]
        return output


class InMemoryMetricsSnapshotRepository:
    def __init__(self):
        self._buckets: dict[str, dict] = {}

    def increment_event(self, bucket_day: str, result: str) -> None:
        bucket = self._buckets.setdefault(
            bucket_day,
            {
                "bucket_day": bucket_day,
                "success_count": 0,
                "failed_count": 0,
                "review_count": 0,
            },
        )
        if result == "success":
            bucket["success_count"] += 1
        elif result == "failed":
            bucket["failed_count"] += 1
        elif result == "review":
            bucket["review_count"] += 1

    def latest_summary(self, from_ts: str | None = None, to_ts: str | None = None) -> dict | None:
        if not self._buckets:
            return None
        days = sorted(self._buckets.keys())
        if from_ts:
            days = [d for d in days if d >= from_ts[:10]]
        if to_ts:
            days = [d for d in days if d <= to_ts[:10]]
        if not days:
            return None
        success = sum(self._buckets[d]["success_count"] for d in days)
        failed = sum(self._buckets[d]["failed_count"] for d in days)
        review = sum(self._buckets[d]["review_count"] for d in days)
        total = success + failed + review
        denominator = total if total > 0 else 1
        return {
            "bucket_day": days[-1],
            "total_events": total,
            "success_count": success,
            "failed_count": failed,
            "review_count": review,
            "success_rate": round(success / denominator, 4),
            "failure_rate": round(failed / denominator, 4),
            "review_rate": round(review / denominator, 4),
        }


class PostgresTelemetryRepository:
    def __init__(self, session_factory=None):
        self._session_factory = session_factory

    def _get_session_factory(self):
        if self._session_factory is not None:
            return self._session_factory
        from deskops_backend.infrastructure.db.session import SessionLocal

        return SessionLocal

    def save(self, event: TelemetryEvent) -> None:
        SessionFactory = self._get_session_factory()
        with SessionFactory.begin() as session:
            session.add(
                TelemetryEventRow(
                    event_id=event.event_id,
                    occurred_at=_parse_iso(event.occurred_at),
                    category=event.category,
                    result=event.result,
                    source=event.source,
                )
            )

    def list(self, from_ts: str | None = None, to_ts: str | None = None) -> list[TelemetryEvent]:
        SessionFactory = self._get_session_factory()
        with SessionFactory() as session:
            query = select(TelemetryEventRow)
            if from_ts:
                query = query.where(TelemetryEventRow.occurred_at >= _parse_iso(from_ts))
            if to_ts:
                query = query.where(TelemetryEventRow.occurred_at <= _parse_iso(to_ts))
            rows = session.scalars(query.order_by(TelemetryEventRow.occurred_at.asc())).all()
            return [
                TelemetryEvent(
                    event_id=row.event_id,
                    occurred_at=row.occurred_at.isoformat(),
                    category=row.category,
                    result=row.result,
                    source=row.source,
                )
                for row in rows
            ]


class PostgresAuditRepository:
    def __init__(self, session_factory=None):
        self._session_factory = session_factory

    def _get_session_factory(self):
        if self._session_factory is not None:
            return self._session_factory
        from deskops_backend.infrastructure.db.session import SessionLocal

        return SessionLocal

    def list(self) -> list[AuditRecord]:
        SessionFactory = self._get_session_factory()
        with SessionFactory() as session:
            rows = session.scalars(select(AuditLogRow).order_by(AuditLogRow.id.desc()).limit(200)).all()
            return [
                AuditRecord(
                    actor=row.actor,
                    action=row.action,
                    target=row.target,
                    result=row.result,
                    timestamp=row.timestamp.isoformat(),
                )
                for row in rows
            ]


class PostgresIngestBundleWriter:
    def __init__(self, session_factory=None):
        self._session_factory = session_factory

    def _get_session_factory(self):
        if self._session_factory is not None:
            return self._session_factory
        from deskops_backend.infrastructure.db.session import SessionLocal

        return SessionLocal

    def save_ingest_bundle(self, event: TelemetryEvent, audit: AuditRecord, outbox_job: dict) -> None:
        occurred_at = _parse_iso(event.occurred_at)
        audit_at = _parse_iso(audit.timestamp)
        payload_json = json.dumps(outbox_job, ensure_ascii=True)
        dedupe_key = f"{outbox_job.get('job_type', 'unknown')}:{event.event_id}"
        SessionFactory = self._get_session_factory()

        try:
            with SessionFactory.begin() as session:
                session.add(
                    TelemetryEventRow(
                        event_id=event.event_id,
                        occurred_at=occurred_at,
                        category=event.category,
                        result=event.result,
                        source=event.source,
                    )
                )
                session.add(
                    OutboxJobRow(
                        job_type=str(outbox_job.get("job_type", "metrics.aggregate")),
                        dedupe_key=dedupe_key,
                        payload_json=payload_json,
                        status="pending",
                        attempts=0,
                    )
                )
                session.add(
                    AuditLogRow(
                        actor=audit.actor,
                        action=audit.action,
                        target=audit.target,
                        result=audit.result,
                        timestamp=audit_at,
                    )
                )
        except IntegrityError as exc:
            raise DuplicateIngestError("duplicate_event_or_dedupe_key") from exc


class PostgresMetricsSnapshotRepository:
    def __init__(self, session_factory=None):
        self._session_factory = session_factory

    def _get_session_factory(self):
        if self._session_factory is not None:
            return self._session_factory
        from deskops_backend.infrastructure.db.session import SessionLocal

        return SessionLocal

    def increment_event(self, bucket_day: str, result: str, session=None) -> None:
        owned_session = False
        if session is None:
            SessionFactory = self._get_session_factory()
            session = SessionFactory()
            owned_session = True
        try:
            row = session.scalar(select(MetricsSnapshotRow).where(MetricsSnapshotRow.bucket_day == bucket_day))
            if row is None:
                row = MetricsSnapshotRow(
                    bucket_day=bucket_day,
                    success_count=0,
                    failed_count=0,
                    review_count=0,
                    success_rate=0,
                )
                session.add(row)
                session.flush()

            if result == "success":
                row.success_count += 1
            elif result == "failed":
                row.failed_count += 1
            elif result == "review":
                row.review_count += 1

            total = row.success_count + row.failed_count + row.review_count
            denominator = total if total > 0 else 1
            row.success_rate = round(row.success_count / denominator, 4)
            if owned_session:
                session.commit()
        finally:
            if owned_session:
                session.close()

    def latest_summary(self, from_ts: str | None = None, to_ts: str | None = None) -> dict | None:
        SessionFactory = self._get_session_factory()
        with SessionFactory() as session:
            query = select(MetricsSnapshotRow)
            if from_ts:
                query = query.where(MetricsSnapshotRow.bucket_day >= from_ts[:10])
            if to_ts:
                query = query.where(MetricsSnapshotRow.bucket_day <= to_ts[:10])
            rows = session.scalars(query.order_by(MetricsSnapshotRow.bucket_day.asc())).all()
            if not rows:
                return None
            success = sum(r.success_count for r in rows)
            failed = sum(r.failed_count for r in rows)
            review = sum(r.review_count for r in rows)
            total = success + failed + review
            denominator = total if total > 0 else 1
            return {
                "bucket_day": rows[-1].bucket_day,
                "total_events": total,
                "success_count": success,
                "failed_count": failed,
                "review_count": review,
                "success_rate": round(success / denominator, 4),
                "failure_rate": round(failed / denominator, 4),
                "review_rate": round(review / denominator, 4),
            }
