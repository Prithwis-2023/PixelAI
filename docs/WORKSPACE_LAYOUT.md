# Workspace Layout

## Directory split
- `/Users/hyhchan/Desktop/automation-pa/apps/desktop`: Tauri + React desktop UI and app shell.
- `/Users/hyhchan/Desktop/automation-pa/services/backend`: Python backend service (FastAPI, domain/application/infrastructure, tests).
- `/Users/hyhchan/Desktop/automation-pa/packages/core`: reusable automation logic (scoring, guard, rollback, orchestrated core flow).
- `/Users/hyhchan/Desktop/automation-pa/packages/contracts`: JSON contracts shared across agents/services.
- `/Users/hyhchan/Desktop/automation-pa/infra/db`: shared SQL artifacts and DB bootstrap scripts.
- `/Users/hyhchan/Desktop/automation-pa/tests`: Node tests for core logic.
- `/Users/hyhchan/Desktop/automation-pa/docs`: product/process docs (layout, runbooks).
- `/Users/hyhchan/Desktop/automation-pa/archive/legacy-node-backend`: archived Node backend (read-only reference).

## Working folder policy
- Product planning docs stay at repository root (`agent.md`, PRD/backlog docs).
- Feature work should be isolated by module:
  - Backend changes only: `services/backend/*`
  - UI changes only: `apps/desktop/*`
  - Logic changes only: `packages/core/*`
  - Contract updates only: `packages/contracts/*`
  - Data model updates only: `infra/db/*`
- For parallel development, create module-specific branches:
  - `codex/backend-*`
  - `codex/desktop-*`
  - `codex/core-*`
  - `codex/data-*`

## Review routing alignment
- Implementer mainly touches module folders above.
- Reviewer validates module scope drift and cross-module coupling.
- Planner escalation is required for P0/P1 or architecture changes.
