import test from "node:test";
import assert from "node:assert/strict";
import { createTelemetryService } from "../src/application/ingest-telemetry.mjs";
import { AuditLog } from "../src/infrastructure/audit/audit-log.mjs";
import { InMemoryQueue } from "../src/infrastructure/queue/in-memory-queue.mjs";
import { InMemoryTelemetryStore } from "../src/infrastructure/store/in-memory-store.mjs";

function buildService() {
  return createTelemetryService({
    store: new InMemoryTelemetryStore(),
    queue: new InMemoryQueue(),
    audit: new AuditLog()
  });
}

test("ingest accepts valid telemetry event", () => {
  const service = buildService();
  const result = service.ingest({
    eventId: "evt_01",
    occurredAt: "2026-02-23T15:00:00.000Z",
    category: "crm_data_entry",
    result: "success"
  });

  assert.equal(result.ok, true);
  assert.equal(result.status, 202);
});

test("ingest rejects invalid payload", () => {
  const service = buildService();
  const result = service.ingest({
    eventId: "",
    occurredAt: "invalid",
    category: "crm_data_entry",
    result: "unknown"
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("summary aggregates success, failed, review", () => {
  const service = buildService();
  service.ingest({
    eventId: "evt_a",
    occurredAt: "2026-02-23T10:00:00.000Z",
    category: "crm_data_entry",
    result: "success"
  });
  service.ingest({
    eventId: "evt_b",
    occurredAt: "2026-02-23T11:00:00.000Z",
    category: "crm_data_entry",
    result: "failed"
  });
  service.ingest({
    eventId: "evt_c",
    occurredAt: "2026-02-23T12:00:00.000Z",
    category: "lead_sync",
    result: "review"
  });

  const summary = service.getSummary();
  assert.equal(summary.totalEvents, 3);
  assert.equal(summary.successCount, 1);
  assert.equal(summary.failedCount, 1);
  assert.equal(summary.reviewCount, 1);
  assert.equal(summary.byCategory.crm_data_entry, 2);
  assert.equal(summary.byCategory.lead_sync, 1);
});
