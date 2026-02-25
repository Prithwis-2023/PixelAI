Task Summary
- Core Objective: Build `DeskOps Copilot` with production-oriented backend AI flow that turns metadata-only work timelines into actionable summaries, automation opportunities, and workflow drafts.
- MVP Scope:
  - Platform: macOS only (desktop source remains local-first)
  - AI Provider: AWS Bedrock Nova Lite (single model for MVP)
  - AI Tasks in scope:
    - Summarizer Agent
    - Opportunity Agent
    - Designer Agent
  - Input policy: metadata-first only (no sensitive raw screen/text payloads)
  - Output policy: strict schema validation + deterministic fallback on invalid AI output
  - Existing backend scope retained: telemetry ingest, metrics, audit, outbox worker
- Out of Scope:
  - Multi-provider routing
  - Vision/audio model usage
  - Full autonomous execution without human confirmation

Architecture & Tech Stack
- Frontend/Desktop:
  - Tauri + React + TypeScript
  - Local encrypted SQLite
- Backend/API:
  - Python 3.12 + FastAPI + Pydantic v2
  - SQLAlchemy 2.x + Alembic
  - PostgreSQL (development: local, production target: AWS Aurora/RDS)
  - Queue pattern: Postgres outbox + polling worker
  - Package manager/environment: `uv`
- AI Runtime:
  - Bedrock Runtime client (AWS Nova Lite)
  - AI Router (single provider/model in MVP)
  - Agent services with prompt templates + schema-bound parsing
  - Fallback strategy:
    1. schema parse fail -> fallback payload generator
    2. provider failure -> fallback payload generator + audit
- External APIs & Integrations:
  - AWS Bedrock Runtime (Nova Lite)
  - Google Sheets API (existing execution pipeline)

Directory Structure (Scaffolding)
- /Users/hyhchan/Desktop/automation-pa
  - agent.md
  - docs/
    - WORKSPACE_LAYOUT.md
  - services/
    - backend/
      - pyproject.toml
      - .env.example
      - alembic/
        - versions/
      - src/
        - deskops_backend/
          - main.py
          - settings.py
          - api/
            - routes/
              - ai.py
              - telemetry.py
              - metrics.py
              - audit.py
              - health.py
          - ai/
            - router.py
            - providers/
              - base.py
              - bedrock_nova_provider.py
            - agents/
              - summarizer_agent.py
              - opportunity_agent.py
              - designer_agent.py
            - prompts/
              - summarizer_v1.md
              - opportunity_v1.md
              - designer_v1.md
            - schemas/
              - summarizer_output.py
              - opportunity_output.py
              - designer_output.py
          - application/
            - ai_orchestration_service.py
            - telemetry_service.py
            - metrics_service.py
          - infrastructure/
            - db/
              - tables.py
              - repositories.py
              - ai_repositories.py
            - audit/
              - audit_repository.py
            - outbox/
              - worker.py
      - tests/
        - test_ai_router.py
        - test_ai_orchestration_service.py
        - test_summarizer_agent.py
        - test_opportunity_agent.py
        - test_designer_agent.py
        - (existing backend tests)
  - apps/
    - desktop/
      - (existing UI skeleton; dashboard paused)
  - packages/
    - core/
    - contracts/
  - infra/
    - db/
      - schema.sql
  - archive/
    - legacy-node-backend/

Execution Plan
1. Add AI schema layer (Summarizer/Opportunity/Designer outputs).
2. Add Bedrock Nova Lite provider adapter and AI router.
3. Add orchestration service with metadata-only sanitization and fallback behavior.
4. Add AI API routes:
   - `POST /v1/ai/summarize`
   - `POST /v1/ai/opportunities`
   - `POST /v1/ai/design`
5. Add AI run/output persistence (`ai_runs`, `ai_outputs`, `prompt_versions`) + Alembic migration.
6. Add unit tests for router, agents, orchestration fallbacks.

Acceptance Criteria
- AI endpoints return schema-valid JSON payloads.
- Non-schema or provider failure paths still return deterministic fallback payloads.
- AI calls are metadata-only by default.
- Every AI request records run metadata (provider/model/status/latency) and output payload.

Risks and Edge Cases
- Risk: Model output shape drift breaks strict parsing.
- Mitigation: per-agent schema validation + fallback payload + audit log.

- Risk: Bedrock credentials or region misconfiguration.
- Mitigation: startup config validation + health endpoint signal + fail-fast option.

- Risk: Metadata payload still contains sensitive text fields.
- Mitigation: allowlist sanitizer before provider invocation.

Orchestrator State
- Current Phase: Implementing (AI MVP) -> Integration Hardening
- Dispatch Rule: implementer -> reviewer; P2/P3 back to implementer, P0/P1 escalate to planner/user
- Status:
  - [x] AI MVP design locked (AWS Nova Lite, metadata-first)
  - [x] AI backend scaffolding implemented
  - [x] AI API endpoints implemented
  - [x] AI DB persistence and migration implemented
  - [x] AI unit tests passing
  - [x] AI run history endpoint and prompt-version persistence implemented
  - [x] Health/startup checks include AI provider readiness
  - [x] Local PostgreSQL connection validated
  - [x] Alembic migrations applied on local PostgreSQL
  - [x] Bedrock Nova Lite live invoke verified (`global.amazon.nova-2-lite-v1:0`)
  - [ ] End-to-end API smoke via running server + curl scripts documented
  - [ ] Desktop telemetry pipeline wired to `/v1/ai/*` endpoints
  - [ ] Production profile finalization (Aurora URL + Bedrock inference profile + secrets manager path)
