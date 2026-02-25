# DESKAPP Implementation Guide (Tauri + Rust)

This file is the **single handoff source** for continuing desktop-agent work in `apps/desktop`.
If this file conflicts with other notes, this file wins.

Last updated: 2026-02-25

## 1) Objective (Non-negotiable)
- Build desktop app on Tauri standard structure.
- Implement local-only capture pipeline:
  - OS event hook
  - active window/app tracking
  - screenshot capture (local file)
  - OCR (local processing)
  - metadata extraction and upload
- Upload only metadata to backend.
- Use backend endpoints exactly as defined (v1 now, v2 planned).

## 2) Current Status Snapshot
### 2.1 Implemented
- Tauri standard app scaffold (`src`, `src-tauri`) with React + TS + Rust commands.
- Hooks:
  - active app/window polling (`osascript`)
  - Chrome active tab URL/domain (best-effort)
  - input summary counters (click/scroll/paste) via `rdev` (no raw keystrokes)
- Capture pipeline:
  - local screenshot file via `screencapture`
  - OCR local-first (Vision via `xcrun swift` -> fallback `tesseract`)
  - redaction for OCR-derived text
- Upload pipeline:
  - local queue + retry
  - health-gated upload
  - classification of upload failures (validation/duplicate/server/network/unknown)
- Observe runtime:
  - permission gating
  - periodic flush (configurable)
  - capture cooldown (configurable)
- Local observation persistence (sensitive/local-only):
  - `segments.jsonl` (work segments with duration)
  - `captures.jsonl` (capture metadata + local raw OCR text)
- Frontend hook controls are wired in current `App.tsx` test UI:
  - start/stop/capture/flush/permission refresh
  - runtime log view
  - local observation stats polling

### 2.2 Not implemented yet
- Backend v2 endpoints + DB tables for segments/captures/session summary.
- Encryption/retention policy for local sensitive artifacts.
- Rich UI for segment/capture browser (currently only summary stats in frontend).

## 3) Canonical Directory Structure (Current)
```text
/Users/hyhchan/Desktop/automation-pa/apps/desktop
├─ DESKAPP.md
├─ README.md
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ index.html
├─ scripts/
│  ├─ smoke-backend.mjs
│  └─ smoke-e2e.mjs
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ styles.css
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
   ├─ build.rs
   ├─ icons/
   │  └─ icon.png
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
      │  ├─ runtime.rs
      │  └─ uploader.rs
      ├─ models/
      │  └─ telemetry.rs
      └─ storage/
         ├─ observations.rs
         ├─ queue.rs
         └─ snapshots.rs
```

## 4) Tauri Commands (Actual)
Frontend must call these via `@tauri-apps/api/tauri.invoke`:
- `start_observe() -> { sessionId: string }`
- `stop_observe() -> { stopped: boolean }`
- `check_permissions() -> { accessibility: boolean, screenRecording: boolean }`
- `capture_snapshot() -> { captureRef: string, path: string, ocrSummary: string }`
- `flush_telemetry_queue() -> { sent, failed, validationFailed, duplicateFailed, serverFailed, networkFailed, unknownFailed }`
- `get_observation_stats() -> { segmentCount, captureCount, lastTaskHint, lastSegmentDurationMs, lastCaptureAt }`

## 5) Data Collection and Boundaries
### 5.1 Collected locally
- active app name
- active window title
- Chrome URL/domain (when available)
- input counters (click/scroll/paste)
- screenshot path
- OCR summary + raw OCR text (local only)
- derived segment fields (`durationMs`, `taskHint`, `confidence`, `activityLevel`)

### 5.2 Uploaded to backend now (v1)
- only `TelemetryEventPayload`:
  - `eventId`, `occurredAt`, `category`, `result`, `source`

### 5.3 Must never be uploaded
- screenshot bytes
- raw OCR full text
- raw key events/keystrokes

## 6) Local Storage Layout
App local data dir (Tauri resolver) contains:
- `snapshots/*.png` (local screenshot files)
- `telemetry-queue.json` (upload queue)
- `telemetry-queue.corrupt-<timestamp>.json` (auto-backup on parse failure)
- `observations/segments.jsonl` (work segment records)
- `observations/captures.jsonl` (capture records)

## 7) Runtime Behavior
- Observe loop polls every 1s.
- On context switch:
  - emits `window_switch`
  - finalizes previous local segment with duration
  - capture pipeline runs if cooldown passed
- On Chrome domain change:
  - emits `url_change`
- Periodic flush:
  - every `DESKOPS_FLUSH_INTERVAL_SECONDS` (default 15)
- Capture cooldown:
  - `DESKOPS_CAPTURE_COOLDOWN_SECONDS` (default 5)
- Permission gate:
  - start/capture blocked if accessibility or screen recording missing

## 8) Backend Contracts
### 8.1 Current production path (must work now)
- `GET /health`
- `POST /v1/telemetry/events`

Expected telemetry responses:
- `202 accepted`
- `400` validation error
- `409` duplicate

### 8.2 Planned extension (next phase)
- v2 contract doc:
  - `/Users/hyhchan/Desktop/automation-pa/docs/TELEMETRY_V2_JSON_CONTRACT.md`
- includes:
  - `POST /v2/telemetry/sessions`
  - `POST /v2/telemetry/segments`
  - `POST /v2/telemetry/captures`
  - `GET /v2/telemetry/sessions/{clientSessionId}/summary`

## 9) Frontend Notes (Current)
- Current `src/App.tsx` is a test-style UI with hook controls attached.
- Tailwind classes are used via CDN script in `index.html` for quick UI testing.
- This is acceptable for now; production hardening should migrate to proper build-time styling setup.

## 10) Runbook
### 10.1 Build checks
```bash
cd /Users/hyhchan/Desktop/automation-pa/apps/desktop
npm run build
cd /Users/hyhchan/Desktop/automation-pa/apps/desktop/src-tauri
. "$HOME/.cargo/env" && cargo check
```

### 10.2 E2E smoke
```bash
cd /Users/hyhchan/Desktop/automation-pa/apps/desktop
npm run smoke:e2e
```
This script starts backend automatically if not running locally.

### 10.3 Tauri dev
```bash
cd /Users/hyhchan/Desktop/automation-pa/apps/desktop
npm run tauri -- dev --no-watch
```

## 11) Environment Variables (Desktop)
- `DESKOPS_BACKEND_URL` (default `http://localhost:4310`)
- `DESKOPS_FLUSH_INTERVAL_SECONDS` (default `15`)
- `DESKOPS_CAPTURE_COOLDOWN_SECONDS` (default `5`)

## 12) Required macOS Permissions
- Accessibility
- Screen Recording

## 13) Priority Next Tasks (for next agent)
1. Implement backend v2 endpoints + migrations from `TELEMETRY_V2_JSON_CONTRACT.md`.
2. Wire desktop uploader dual-mode:
   - keep v1 events
   - add v2 segments/captures metadata upload
3. Add local sensitive-data protection:
   - encrypted-at-rest for `observations/*.jsonl`
   - retention/TTL cleanup policy
4. Improve frontend operational visibility:
   - recent segment list
   - capture timeline
   - queue depth and retry state

## 14) Acceptance Checklist (Current Phase)
- Desktop app builds/runs.
- Hook events captured locally.
- Local observations persisted (`segments.jsonl`, `captures.jsonl`).
- Metadata-only upload to v1 succeeds.
- 400/409/network failures are visible in flush results/logs.
- Sensitive raw content never uploaded.
