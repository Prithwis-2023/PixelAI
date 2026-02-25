from deskops_backend.domain.models import TelemetryEvent


def calculate_summary(events: list[TelemetryEvent]) -> dict:
    total = len(events)
    success_count = sum(1 for e in events if e.result == "success")
    failed_count = sum(1 for e in events if e.result == "failed")
    review_count = sum(1 for e in events if e.result == "review")
    by_category: dict[str, int] = {}

    for event in events:
        by_category[event.category] = by_category.get(event.category, 0) + 1

    denominator = total if total > 0 else 1
    return {
        "total_events": total,
        "success_count": success_count,
        "failed_count": failed_count,
        "review_count": review_count,
        "success_rate": round(success_count / denominator, 4),
        "failure_rate": round(failed_count / denominator, 4),
        "review_rate": round(review_count / denominator, 4),
        "by_category": by_category,
    }
