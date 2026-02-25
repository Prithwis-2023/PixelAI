from deskops_backend.ai.providers.bedrock_nova_provider import BedrockNovaProvider
from deskops_backend.ai.router import AiRouter
from deskops_backend.application.ai_orchestration_service import AiOrchestrationService
from deskops_backend.application.metrics_service import MetricsService
from deskops_backend.application.metrics_projector import MetricsProjector
from deskops_backend.application.telemetry_service import TelemetryService
from deskops_backend.infrastructure.db.ai_repositories import InMemoryAiRepository, PostgresAiRepository
from deskops_backend.infrastructure.audit.audit_repository import InMemoryAuditRepository
from deskops_backend.infrastructure.db.repositories import (
    InMemoryMetricsSnapshotRepository,
    InMemoryTelemetryRepository,
    PostgresAuditRepository,
    PostgresIngestBundleWriter,
    PostgresMetricsSnapshotRepository,
    PostgresTelemetryRepository,
)
from deskops_backend.infrastructure.outbox.publisher import InMemoryOutboxPublisher
from deskops_backend.infrastructure.outbox.worker import PostgresOutboxWorker
from deskops_backend.settings import settings


class ServiceContainer:
    def __init__(self):
        provider = BedrockNovaProvider(
            region=settings.ai_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            aws_session_token=settings.aws_session_token,
            aws_profile=settings.aws_profile,
        )
        self.ai_router = AiRouter(
            provider=provider,
            model_id=settings.ai_model_id,
            max_tokens=settings.ai_max_tokens,
            temperature=settings.ai_temperature,
            timeout_seconds=settings.ai_timeout_seconds,
        )

        if settings.use_in_memory_repositories:
            self.telemetry_repository = InMemoryTelemetryRepository()
            self.audit_repository = InMemoryAuditRepository()
            self.outbox_publisher = InMemoryOutboxPublisher()
            self.snapshot_repository = InMemoryMetricsSnapshotRepository()
            self.ai_repository = InMemoryAiRepository()
            self.outbox_worker = None
            ingest_bundle_writer = None
        else:
            self.telemetry_repository = PostgresTelemetryRepository()
            self.audit_repository = PostgresAuditRepository()
            self.outbox_publisher = InMemoryOutboxPublisher()
            self.snapshot_repository = PostgresMetricsSnapshotRepository()
            self.ai_repository = PostgresAiRepository()
            self.metrics_projector = MetricsProjector(self.snapshot_repository)
            self.outbox_worker = PostgresOutboxWorker(job_handler=self.metrics_projector.handle_outbox_job)
            ingest_bundle_writer = PostgresIngestBundleWriter()

        self.telemetry_service = TelemetryService(
            telemetry_repository=self.telemetry_repository,
            audit_repository=self.audit_repository,
            outbox_publisher=self.outbox_publisher,
            ingest_bundle_writer=ingest_bundle_writer,
        )
        self.metrics_service = MetricsService(
            telemetry_repository=self.telemetry_repository,
            snapshot_repository=self.snapshot_repository,
        )
        self.ai_service = AiOrchestrationService(
            router=self.ai_router,
            ai_repository=self.ai_repository,
            metadata_only=settings.ai_metadata_only,
        )

    @property
    def outbox_enabled(self) -> bool:
        return self.outbox_worker is not None


container = ServiceContainer()
