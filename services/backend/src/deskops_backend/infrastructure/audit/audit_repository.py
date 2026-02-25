from deskops_backend.domain.models import AuditRecord


class InMemoryAuditRepository:
    def __init__(self):
        self._records: list[AuditRecord] = []

    def append(self, record: AuditRecord) -> None:
        self._records.append(record)

    def list(self) -> list[AuditRecord]:
        return list(self._records)
