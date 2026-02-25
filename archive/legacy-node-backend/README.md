# Backend MVP

## Locked MVP Stack
- Runtime: Node.js 20 (ESM)
- API: Node HTTP server (framework-free for MVP speed)
- Queue: in-memory queue abstraction (Redis/BullMQ adapter later)
- Storage: in-memory repository abstraction (Postgres adapter later)
- Audit: append-only in-memory audit log (DB sink later)

## Folder Structure
- `src/api`: HTTP route handlers
- `src/application`: use-cases (ingest telemetry, summarize metrics)
- `src/domain`: validation and metric calculation rules
- `src/infrastructure`: store/queue/audit adapters
- `tests`: backend unit tests

## MVP Endpoints
- `GET /health`
- `POST /v1/telemetry/events`
- `GET /v1/metrics/summary`
- `GET /v1/audit/logs`

## Run
- `cd /Users/hyhchan/Desktop/automation-pa/backend`
- `npm test`
- `npm start`
