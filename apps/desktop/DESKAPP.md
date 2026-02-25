# DESKAPP Implementation Guide (Tauri + Rust)

This document is the implementation handoff for desktop capture pipeline work.
Goal: enable another agent to build local screen observation and metadata upload flow without guessing.

## 1) Target Scope
- Build desktop app on Tauri standard structure.
- Implement local-only capture pipeline:
  - OS event hook
  - active window/app tracking
  - screenshot capture (local file)
  - OCR (local processing)
  - metadata extraction and upload
- Upload only metadata to backend.
- Use existing backend endpoints exactly as defined below.

## 2) Target Directory Structure (Tauri Standard)
Use `apps/desktop` as the canonical app root.

```text
/Users/hyhchan/Desktop/automation-pa/apps/desktop
├─ DESKAPP.md
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ ui/
│  │  ├─ ObserveDashboard.tsx
│  │  ├─ CandidateList.tsx
│  │  └─ RunCenter.tsx
│  ├─ lib/
│  │  ├─ bridge/
│  │  │  ├─ observe.ts
│  │  │  ├─ permissions.ts
│  │  │  └─ telemetry.ts
│  │  └─ types/
│  │     └─ telemetry.ts
│  └─ state/
│     └─ observeStore.ts
└─ src-tauri/
   ├─ Cargo.toml
   ├─ tauri.conf.json
   └─ src/
      ├─ main.rs
      ├─ commands/
      │  ├─ observe.rs
      │  ├─ permissions.rs
      │  └─ telemetry.rs
      ├─ capture/
      │  ├─ screenshot.rs
      │  ├─ ocr.rs
      │  └─ redaction.rs
      ├─ hooks/
      │  ├─ app_window.rs
      │  └─ input_events.rs
      ├─ pipeline/
      │  ├─ collector.rs
      │  ├─ normalizer.rs
      │  └─ uploader.rs
      ├─ models/
      │  └─ telemetry.rs
      └─ storage/
         ├─ queue.rs
         └─ snapshots.rs
```

## 3) Rust Commands Required (Tauri invoke)
Implement these commands first:
- `start_observe() -> { sessionId: string }`
- `stop_observe() -> { stopped: bool }`
- `check_permissions() -> { accessibility: bool, screenRecording: bool }`
- `capture_snapshot() -> { captureRef: string, path: string, ocrSummary: string }`
- `flush_telemetry_queue() -> { sent: number, failed: number }`

Frontend bridge (`src/lib/bridge/*`) must call these commands via Tauri invoke.

## 4) Local Capture/OCR Pipeline Requirements
- Input sources:
  - active app/window change
  - URL/domain changes (Chrome only if available)
  - user interaction summary (click/scroll/paste counts; no raw keystrokes)
  - screenshot at state change (cooldown 5s)
- OCR:
  - local execution only
  - extract concise summary text, not full raw dump
- Redaction:
  - redact sensitive candidates before metadata creation
  - never upload raw screenshot bytes
- Queue:
  - when offline, store telemetry in local queue and retry later

## 5) Backend Contracts (Must Match Exactly)
Backend base URL is configurable; default `http://localhost:4310`.

### 5.1 Telemetry ingest
- Endpoint: `POST /v1/telemetry/events`
- Request JSON:
```json
{
  "eventId": "evt_20260224_0001",
  "occurredAt": "2026-02-24T10:00:00Z",
  "category": "window_switch",
  "result": "success",
  "source": "desktop-agent"
}
```
- Required fields:
  - `eventId` non-empty string
  - `occurredAt` ISO8601 string
  - `category` non-empty string
  - `result` must be one of: `success`, `failed`, `review`
  - `source` optional, defaults to `desktop-agent`
- Responses:
  - `202` accepted
  - `400` validation error (`missing_or_invalid_*`, `invalid_result`, `invalid_occurred_at`)
  - `409` duplicate (`duplicate_ingest`)

### 5.2 Health check
- Endpoint: `GET /health`
- Use this before start/flush to check backend and AI readiness.

### 5.3 Optional AI endpoints for next phase
- `POST /v1/ai/summarize`
- `POST /v1/ai/opportunities`
- `POST /v1/ai/design`
- `GET /v1/ai/runs`

For now, capture pipeline only needs telemetry ingest + health.

## 6) Telemetry Category Conventions (Desktop Side)
Use stable categories so backend analytics remain consistent:
- `observe_session_start`
- `observe_session_stop`
- `window_switch`
- `url_change`
- `screenshot_captured`
- `ocr_processed`
- `capture_pipeline_error`
- `upload_success`
- `upload_failed`

Result mapping:
- normal path: `success`
- recoverable issue (human check needed): `review`
- hard failure: `failed`

## 7) Frontend Type Contracts
Define in `src/lib/types/telemetry.ts`:
- `TelemetryEventPayload`
- `PermissionState`
- `CaptureSnapshotResult`
- `FlushResult`

Match backend field names exactly (`eventId`, `occurredAt`, `category`, `result`, `source`).

## 8) Minimal Execution Sequence
1. App boot -> call `check_permissions`.
2. User clicks Observe -> `start_observe`.
3. Collector listens for app/window changes.
4. On state change:
   - `capture_snapshot`
   - run OCR + redaction locally
   - build telemetry metadata event
   - enqueue for upload
5. Periodic or manual `flush_telemetry_queue`.
6. User stops Observe -> `stop_observe`.

## 9) Non-Negotiable Safety Rules
- Never upload raw screenshot image bytes.
- Never upload raw keystrokes.
- Only upload metadata fields required by backend contracts.
- If uncertain about a field, drop it rather than upload sensitive content.

## 10) Acceptance Checklist
- Tauri app builds and runs.
- Rust commands callable from frontend.
- Local queue retry works.
- `POST /v1/telemetry/events` returns `202` for valid events.
- `400/409` errors are handled and visible in UI logs.
- No sensitive raw content leaves local machine.
