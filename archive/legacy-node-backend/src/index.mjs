import { createServer } from "./api/server.mjs";
import { createTelemetryService } from "./application/ingest-telemetry.mjs";
import { AuditLog } from "./infrastructure/audit/audit-log.mjs";
import { InMemoryQueue } from "./infrastructure/queue/in-memory-queue.mjs";
import { InMemoryTelemetryStore } from "./infrastructure/store/in-memory-store.mjs";

const telemetryService = createTelemetryService({
  store: new InMemoryTelemetryStore(),
  queue: new InMemoryQueue(),
  audit: new AuditLog()
});

const server = createServer(telemetryService);
const port = Number(process.env.PORT ?? 4310);

server.listen(port, () => {
  console.log(`Backend MVP listening on http://localhost:${port}`);
});
