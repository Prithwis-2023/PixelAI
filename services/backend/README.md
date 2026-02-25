# DeskOps Backend (Python)

MVP backend service for telemetry ingestion, metrics summaries, audit log retrieval, and AI agent orchestration.

## Stack
- Python 3.12
- FastAPI
- SQLAlchemy + psycopg (Aurora/RDS PostgreSQL)
- Alembic migrations
- uv for env/package management

## Setup
```bash
cd /Users/hyhchan/Desktop/automation-pa/services/backend
cp .env.example .env
uv sync
uv run uvicorn deskops_backend.main:app --reload --app-dir src
```

Do not commit `.env` (secrets). Only commit `.env.example`.

### Background Outbox Worker
- In-server daemon mode: set `ENABLE_OUTBOX_DAEMON=true`.
- Standalone worker process:
```bash
cd /Users/hyhchan/Desktop/automation-pa/services/backend
USE_IN_MEMORY_REPOSITORIES=false PYTHONPATH=src uv run python -m deskops_backend.workers.run_outbox
```

### Postgres Mode
1. Set `USE_IN_MEMORY_REPOSITORIES=false` in `.env`.
2. Ensure `DATABASE_URL` points to Aurora/RDS PostgreSQL.
3. Run migrations:
```bash
cd /Users/hyhchan/Desktop/automation-pa/services/backend
PYTHONPATH=src uv run alembic upgrade head
```
4. Optional startup behavior:
   - `DB_STARTUP_CHECK_ENABLED=true`: validate DB on app startup.
   - `DB_STARTUP_FAIL_FAST=true`: fail app boot if DB is unreachable.
   - `AI_STARTUP_FAIL_FAST=false`: if true, fail app boot when Bedrock client is not ready.

## Test
```bash
cd /Users/hyhchan/Desktop/automation-pa/services/backend
python3 -m unittest discover -s tests -p "test_*.py"
```

## API
- `GET /health`
- `POST /v1/telemetry/events`
- `GET /v1/metrics/summary`
- `GET /v1/audit/logs`
- `POST /v1/metrics/outbox/poll?limit=100&max_attempts=3`
- `POST /v1/ai/summarize`
- `POST /v1/ai/opportunities`
- `POST /v1/ai/design`
- `GET /v1/ai/runs`

`POST /v1/telemetry/events` returns `409` when duplicate ingest is detected.
Outbox worker marks failed jobs as `retry` and escalates to `failed` after `max_attempts`.
`GET /health` includes DB connectivity and required-table status in Postgres mode.
AI endpoints use metadata-only policy by default (`AI_METADATA_ONLY=true`).
`GET /health` includes AI provider readiness and startup checks.
