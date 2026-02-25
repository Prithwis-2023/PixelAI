import http from "node:http";

function json(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

export function createServer(telemetryService) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");

    if (request.method === "GET" && url.pathname === "/health") {
      return json(response, 200, { ok: true });
    }

    if (request.method === "POST" && url.pathname === "/v1/telemetry/events") {
      try {
        const body = await readJsonBody(request);
        const result = telemetryService.ingest(body);
        return json(response, result.status, result.ok ? result.data : { error: result.error });
      } catch {
        return json(response, 400, { error: "invalid_json" });
      }
    }

    if (request.method === "GET" && url.pathname === "/v1/metrics/summary") {
      const from = url.searchParams.get("from") ?? undefined;
      const to = url.searchParams.get("to") ?? undefined;
      return json(response, 200, telemetryService.getSummary({ from, to }));
    }

    if (request.method === "GET" && url.pathname === "/v1/audit/logs") {
      return json(response, 200, { records: telemetryService.getAuditLogs() });
    }

    return json(response, 404, { error: "not_found" });
  });
}
