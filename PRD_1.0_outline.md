# DeskOps Copilot PRD 1.0 Outline

## 1. Product Overview
- Problem statement
- Target users and core jobs-to-be-done
- Product thesis (local-first observation -> high-confidence automation)

## 2. MVP Goals and Non-Goals
- MVP goals (6-week delivery)
- Non-goals and deferred items
- Assumptions and constraints (macOS-only, Chrome + Google Sheets)

## 3. User Personas and Primary Scenarios
- Persona A: SMB back-office operator
- Persona B: CS/Sales operations specialist
- Persona C: Freelancer/solo operator
- Primary scenario: repetitive CRM update from spreadsheet data

## 4. End-to-End User Journey
- Install and onboarding
- Observe mode (3-7 days)
- Daily summary card generation
- Top 3 automation candidate recommendation
- Permission checklist and approvals
- Test run, production run (manual/scheduled)
- Failure handling (retry/rollback/human review)

## 5. Functional Requirements
- FR-1 Observation and timeline generation
- FR-2 Daily summarization and repetitive pattern extraction
- FR-3 Opportunity scoring and ranking (success-probability weighted)
- FR-4 Workflow design for selected candidate
- FR-5 Permission state machine and OAuth flow
- FR-6 Automation build and execution pipeline
- FR-7 Guard decisioning and run gating
- FR-8 Audit logging and telemetry export

## 6. Agent Contracts (I/O Spec Summary)
- Observer Agent input/output schema
- Summarizer Agent input/output schema
- Opportunity Agent input/output schema
- Designer Agent input/output schema
- Permission Agent input/output schema
- Builder Agent input/output schema
- Guard Agent input/output schema

## 7. Data Collection and Privacy Requirements
- Allowed data classes (event metadata, URL/path, action type)
- Disallowed data classes (raw keystrokes, unsolicited sensitive content)
- Event-triggered screenshot policy + cooldown
- Redaction policy for PII and sensitive fields
- Data retention windows and deletion policy

## 8. Permissions and Security
- macOS permissions (accessibility, screen recording)
- Google OAuth scope (Sheets read/write only)
- Least privilege policy and user-visible rationale
- Encryption at rest and in transit
- Audit log requirements (who/when/what/permissions/result)

## 9. Automation Definition (MVP Single Type)
- Input source: Google Sheets rows
- Target execution: Chrome CRM form fill/update
- Output: write-back status to Sheets
- Idempotency and duplicate-prevention strategy
- Validation and post-submit verification

## 10. Guardrails and Error Handling
- Block conditions
- Confirm-required conditions
- Allow conditions
- Rollback strategies and checkpoints
- Human-review handoff protocol

## 11. Telemetry and Dashboard
- Server-uploaded events (aggregate work categories, success/failure metrics)
- Metrics pipeline and schema
- Dashboard views (trend, approval, success, failure reasons)

## 12. KPI Definitions and Release Gates
- Candidate precision definition
- Approval rate definition
- Execution success rate definition
- Weekly time-saved estimation methodology
- Go/No-Go thresholds and quality gates

## 13. UX and Core Screens
- Screen 1: Observe mode dashboard
- Screen 2: Daily summary card
- Screen 3: Top 3 automation candidates
- Screen 4: Permission checklist and consent
- Screen 5: Test-run/result and run controls

## 14. Testing and Validation Plan
- Unit tests (agent transforms, scoring, redaction)
- Integration tests (Sheets + Playwright flow)
- End-to-end tests (approval to execution)
- Security and privacy validation checklist

## 15. Rollout Plan
- Internal dogfooding
- Pilot cohort rollout
- Feedback loop and threshold tuning
- MVP release decision process

## 16. Open Decisions
- KPI labeling workflow details
- CRM target template final selection
- Permission request UX strictness policy
