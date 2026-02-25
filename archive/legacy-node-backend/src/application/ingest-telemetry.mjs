import { validateTelemetryEvent } from "../domain/telemetry-schema.mjs";
import { calculateSummary } from "../domain/metrics-calculator.mjs";

export function createTelemetryService({ store, queue, audit }) {
  function ingest(event) {
    const validation = validateTelemetryEvent(event);
    if (!validation.valid) {
      return { ok: false, status: 400, error: validation.reason };
    }

    store.save(event);
    queue.enqueue({
      type: "metrics.aggregate",
      eventId: event.eventId
    });
    audit.append({
      actor: "backend-api",
      action: "telemetry_ingested",
      target: event.eventId,
      result: "success"
    });

    return { ok: true, status: 202, data: { accepted: true } };
  }

  function getSummary(range = {}) {
    return calculateSummary(store.list(range));
  }

  function getAuditLogs() {
    return audit.list();
  }

  return {
    ingest,
    getSummary,
    getAuditLogs
  };
}
