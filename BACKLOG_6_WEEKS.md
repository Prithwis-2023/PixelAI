# DeskOps Copilot MVP - 6 Week Backlog

## Week 1 - Foundations and Data Policy
- [ ] Repo and module scaffolding (Tauri + React + TS + local services)
- [ ] Define canonical event schema (`session_event`, `timeline_entry`)
- [ ] Implement macOS permission preflight checks
- [ ] Define and implement data minimization rules (allowlist/denylist)
- [ ] Set up encrypted local storage (SQLite) and retention jobs
- [ ] CI baseline (lint/test/build)
- Deliverable: Local app boots, permissions are detectable, event schema frozen.

## Week 2 - Observer + Summarizer MVP
- [ ] Implement observer ingestion for app/window/URL/action metadata
- [ ] Add event-driven capture orchestration with cooldown
- [ ] Integrate OCR pipeline on captured frames
- [ ] Build redaction pipeline before persistence
- [ ] Implement timeline JSON emitter
- [ ] Build daily summary generation (task groups + counts + durations)
- Deliverable: Daily summary card from real local sessions.

## Week 3 - Opportunity and Candidate UX
- [ ] Implement repetitive-pattern detector from 3-7 day timelines
- [ ] Implement opportunity scoring model
- [ ] Weight scoring toward success probability (`0.6`) over time saving (`0.15`)
- [ ] Generate Top 3 candidate payloads with confidence and risk signals
- [ ] Build candidate UI with "Create Automation" action
- [ ] Add candidate feedback capture (accept/reject reason)
- Deliverable: User sees Top 3 candidates and can choose one.

## Week 4 - Designer + Permission Flow
- [ ] Implement workflow definition schema for selected candidate
- [ ] Implement exception path and rollback plan generation
- [ ] Build permission checklist state machine (OS + Google OAuth)
- [ ] Integrate Google OAuth (Sheets read/write only)
- [ ] Build permission UX with explicit rationale per item
- [ ] Persist consent/audit entries locally
- Deliverable: Chosen candidate can pass through permission approval flow.

## Week 5 - Builder + Guard + Execution
- [ ] Implement builder for single automation template:
      Sheets row -> Chrome CRM form -> Sheets write-back
- [ ] Integrate Playwright execution engine and selector strategy
- [ ] Implement Guard policy engine (allow/block/confirm-required)
- [ ] Implement idempotency keys and duplicate submission prevention
- [ ] Implement rollback primitives and retry/human-review fallback
- [ ] Add structured run logs and failure classification
- Deliverable: End-to-end test run possible with safe failure handling.

## Week 6 - Telemetry, Hardening, and Pilot Readiness
- [ ] Implement telemetry upload API client (aggregate events only)
- [ ] Backend ingestion + metrics aggregation pipeline
- [ ] Dashboard MVP for usage and success/failure trends
- [ ] E2E reliability pass and flaky-run fixes
- [ ] Privacy/security checklist validation and incident drill
- [ ] Pilot release checklist and go/no-go review
- Deliverable: Pilot-ready MVP with measurable KPI instrumentation.

## Cross-Cutting QA Gates (Every Week)
- [ ] No raw sensitive payload leaves local device
- [ ] Audit log coverage for run-critical actions
- [ ] Regression tests for permission flow and execution safety
- [ ] Weekly risk review and scope lock (no unapproved feature creep)

## MVP Go/No-Go Metrics (Week 6 Review)
- [ ] Candidate precision >= 70%
- [ ] Automation approval rate >= 25%
- [ ] Automation success rate >= 85%
- [ ] Weekly time saved >= 1 hour per active user
- [ ] P0 security incidents = 0
- [ ] Sensitive raw data external transfer = 0
