from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class TelemetryEvent:
    event_id: str
    occurred_at: str
    category: str
    result: str
    source: str = "desktop-agent"


@dataclass(frozen=True)
class AuditRecord:
    actor: str
    action: str
    target: str
    result: str
    timestamp: str


def is_valid_iso8601(timestamp: str) -> bool:
    try:
        datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        return True
    except ValueError:
        return False
