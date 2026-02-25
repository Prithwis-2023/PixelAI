# Telemetry API v2 JSON Contract (Desktop -> Backend)

## 1. Scope
This document defines the **exact v2 backend contract** for ingesting desktop work context metadata.

Goals:
- Keep sensitive payloads local to desktop.
- Store backend-side data needed for:
  - "what work was done"
  - "how long it took"
  - automation opportunity ranking.

Non-goals:
- Uploading raw screenshots.
- Uploading raw OCR text.
- Uploading raw keystrokes.

---

## 2. Privacy Boundary
### 2.1 Local-only data (never uploaded)
- screenshot image bytes
- raw OCR full text
- window text/body that contains sensitive content
- raw key events / key logs

### 2.2 Backend-ingestable data (metadata only)
- session/segment identifiers
- timestamps and duration
- normalized app/domain labels
- interaction counts and activity level
- task hint + confidence
- capture metadata (path hash/ref, OCR summary snippet if redacted)

---

## 3. Endpoint Summary
- `POST /v2/telemetry/sessions` : create/update observe session envelope
- `POST /v2/telemetry/segments` : ingest one or many work segments
- `POST /v2/telemetry/captures` : ingest capture metadata (no image bytes)
- `GET /v2/telemetry/sessions/{clientSessionId}/summary` : retrieve aggregated session summary

Compatibility:
- Existing `POST /v1/telemetry/events` remains supported.
- v2 does not replace v1 immediately; both can run in parallel during migration.

---

## 4. JSON Schemas

## 4.1 POST `/v2/telemetry/sessions`
### Request
```json
{
  "clientSessionId": "sess_3c3f9f03-8a8f-4f36-a1be-7f1693f93d3f",
  "source": "desktop-agent",
  "startedAt": "2026-02-25T06:10:12.123Z",
  "endedAt": null,
  "status": "running",
  "device": {
    "platform": "macos",
    "appVersion": "0.1.0"
  }
}
```

### Validation
- `clientSessionId`: required, non-empty, max 120 chars
- `source`: optional, default `desktop-agent`, max 100 chars
- `startedAt`: required ISO8601 UTC
- `endedAt`: optional ISO8601 UTC, must be `>= startedAt` when provided
- `status`: required enum: `running | stopped`
- `device.platform`: required enum: `macos`
- `device.appVersion`: optional, max 40 chars

### Response
- `202 Accepted`
```json
{
  "accepted": true,
  "upserted": true
}
```

### Error codes
- `400 missing_or_invalid_client_session_id`
- `400 invalid_started_at`
- `400 invalid_ended_at`
- `400 invalid_session_status`
- `400 invalid_device_platform`

---

## 4.2 POST `/v2/telemetry/segments`
Supports single and batch ingest.

### Request
```json
{
  "segments": [
    {
      "segmentId": "seg_20260225061030_a18fd237",
      "clientSessionId": "sess_3c3f9f03-8a8f-4f36-a1be-7f1693f93d3f",
      "startedAt": "2026-02-25T06:09:55.100Z",
      "endedAt": "2026-02-25T06:10:30.250Z",
      "durationMs": 35150,
      "appName": "Google Chrome",
      "windowTitle": "Order Dashboard - Chrome",
      "domain": "example-commerce.com",
      "url": "https://example-commerce.com/orders",
      "clickCount": 17,
      "scrollCount": 8,
      "pasteCount": 1,
      "activityLevel": "medium",
      "taskHint": "ops_data_entry",
      "confidence": 0.73,
      "closeReason": "window_switch",
      "result": "success",
      "source": "desktop-agent"
    }
  ]
}
```

### Validation (each segment)
- `segmentId`: required, unique, non-empty, max 120 chars
- `clientSessionId`: required, non-empty, max 120 chars
- `startedAt`, `endedAt`: required ISO8601 UTC, `endedAt >= startedAt`
- `durationMs`: required integer `>= 0`, must match `(endedAt-startedAt)` within ±2000ms tolerance
- `appName`: required, max 120 chars
- `windowTitle`: optional, max 300 chars
- `domain`: optional, max 255 chars
- `url`: optional, max 1024 chars (query/body redaction recommended client-side)
- `clickCount`, `scrollCount`, `pasteCount`: required integer `>= 0`
- `activityLevel`: required enum: `idle | low | medium | high`
- `taskHint`: required, max 80 chars
- `confidence`: required float `0.0 <= x <= 1.0`
- `closeReason`: required enum: `window_switch | session_stop | manual`
- `result`: required enum: `success | failed | review`
- `source`: optional, default `desktop-agent`

### Response
- `202 Accepted`
```json
{
  "accepted": true,
  "received": 1,
  "inserted": 1,
  "duplicates": 0,
  "failed": 0,
  "errors": []
}
```

### Partial failure response
- `207 Multi-Status`
```json
{
  "accepted": true,
  "received": 3,
  "inserted": 2,
  "duplicates": 1,
  "failed": 0,
  "errors": []
}
```

### Error codes
- `400 missing_or_invalid_segments`
- `400 missing_or_invalid_segment_id`
- `400 missing_or_invalid_client_session_id`
- `400 invalid_started_at`
- `400 invalid_ended_at`
- `400 invalid_duration_ms`
- `400 invalid_activity_level`
- `400 invalid_result`
- `400 invalid_close_reason`
- `400 invalid_confidence`
- `409 duplicate_segment`

---

## 4.3 POST `/v2/telemetry/captures`
Capture metadata only, no binary upload.

### Request
```json
{
  "captures": [
    {
      "captureRef": "cap_20260225061031_7fd12f90",
      "clientSessionId": "sess_3c3f9f03-8a8f-4f36-a1be-7f1693f93d3f",
      "occurredAt": "2026-02-25T06:10:31.110Z",
      "appName": "Google Chrome",
      "windowTitle": "Order Dashboard - Chrome",
      "domain": "example-commerce.com",
      "url": "https://example-commerce.com/orders",
      "ocrEngine": "vision",
      "ocrSuccess": true,
      "ocrSummary": "Order table and shipment status visible",
      "hasLocalRaw": true,
      "source": "desktop-agent"
    }
  ]
}
```

### Validation
- `captureRef`: required, unique, max 120 chars
- `clientSessionId`: required, max 120 chars
- `occurredAt`: required ISO8601 UTC
- `appName`: required, max 120 chars
- `windowTitle`: optional, max 300 chars
- `domain`: optional, max 255 chars
- `url`: optional, max 1024 chars
- `ocrEngine`: required enum: `vision | tesseract | unavailable | failed`
- `ocrSuccess`: required boolean
- `ocrSummary`: optional, max 500 chars, must be redacted/safe summary text
- `hasLocalRaw`: required boolean (indicates local-only sensitive artifact exists)
- `source`: optional, default `desktop-agent`

### Response
- `202 Accepted`
```json
{
  "accepted": true,
  "received": 1,
  "inserted": 1,
  "duplicates": 0,
  "failed": 0,
  "errors": []
}
```

### Error codes
- `400 missing_or_invalid_captures`
- `400 missing_or_invalid_capture_ref`
- `400 missing_or_invalid_client_session_id`
- `400 invalid_occurred_at`
- `400 invalid_ocr_engine`
- `400 invalid_ocr_summary`
- `409 duplicate_capture`

---

## 4.4 GET `/v2/telemetry/sessions/{clientSessionId}/summary`
### Response
- `200 OK`
```json
{
  "clientSessionId": "sess_3c3f9f03-8a8f-4f36-a1be-7f1693f93d3f",
  "status": "stopped",
  "startedAt": "2026-02-25T06:10:12.123Z",
  "endedAt": "2026-02-25T06:55:00.000Z",
  "totalDurationMs": 2687877,
  "activeDurationMs": 2012345,
  "idleDurationMs": 675532,
  "segments": 42,
  "captures": 16,
  "topTaskHints": [
    { "taskHint": "ops_data_entry", "durationMs": 1200000 },
    { "taskHint": "spreadsheet_update", "durationMs": 512000 }
  ]
}
```

### Error codes
- `404 session_not_found`

---

## 5. Database Structure (Backend v2)
PostgreSQL target.

## 5.1 `telemetry_sessions_v2`
```sql
CREATE TABLE telemetry_sessions_v2 (
  client_session_id VARCHAR(120) PRIMARY KEY,
  source VARCHAR(100) NOT NULL DEFAULT 'desktop-agent',
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NULL,
  status VARCHAR(20) NOT NULL,
  device_platform VARCHAR(20) NOT NULL,
  app_version VARCHAR(40) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_v2_started_at ON telemetry_sessions_v2 (started_at DESC);
```

## 5.2 `telemetry_segments_v2`
```sql
CREATE TABLE telemetry_segments_v2 (
  segment_id VARCHAR(120) PRIMARY KEY,
  client_session_id VARCHAR(120) NOT NULL REFERENCES telemetry_sessions_v2(client_session_id),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  duration_ms BIGINT NOT NULL,
  app_name VARCHAR(120) NOT NULL,
  window_title VARCHAR(300) NULL,
  domain VARCHAR(255) NULL,
  url VARCHAR(1024) NULL,
  click_count INT NOT NULL DEFAULT 0,
  scroll_count INT NOT NULL DEFAULT 0,
  paste_count INT NOT NULL DEFAULT 0,
  activity_level VARCHAR(20) NOT NULL,
  task_hint VARCHAR(80) NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  close_reason VARCHAR(30) NOT NULL,
  result VARCHAR(30) NOT NULL,
  source VARCHAR(100) NOT NULL DEFAULT 'desktop-agent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_segments_v2_session ON telemetry_segments_v2 (client_session_id, started_at);
CREATE INDEX idx_segments_v2_task_hint ON telemetry_segments_v2 (task_hint, started_at DESC);
CREATE INDEX idx_segments_v2_domain ON telemetry_segments_v2 (domain, started_at DESC);
```

## 5.3 `telemetry_captures_v2`
```sql
CREATE TABLE telemetry_captures_v2 (
  capture_ref VARCHAR(120) PRIMARY KEY,
  client_session_id VARCHAR(120) NOT NULL REFERENCES telemetry_sessions_v2(client_session_id),
  occurred_at TIMESTAMPTZ NOT NULL,
  app_name VARCHAR(120) NOT NULL,
  window_title VARCHAR(300) NULL,
  domain VARCHAR(255) NULL,
  url VARCHAR(1024) NULL,
  ocr_engine VARCHAR(20) NOT NULL,
  ocr_success BOOLEAN NOT NULL,
  ocr_summary VARCHAR(500) NULL,
  has_local_raw BOOLEAN NOT NULL,
  source VARCHAR(100) NOT NULL DEFAULT 'desktop-agent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_captures_v2_session ON telemetry_captures_v2 (client_session_id, occurred_at);
CREATE INDEX idx_captures_v2_domain ON telemetry_captures_v2 (domain, occurred_at DESC);
```

---

## 6. Idempotency and Deduplication
- `segmentId` and `captureRef` are idempotency keys.
- Duplicate ingest must not create new rows.
- Duplicate behavior:
  - batch endpoint: count in `duplicates`
  - single-item endpoint mode: may return `409 duplicate_*`

---

## 7. Security/Compliance Rules (Server)
- Reject request bodies containing binary data fields.
- Reject payloads with known sensitive keys (`rawText`, `screenshotBytes`, `keystrokes`).
- Enforce length limits to prevent accidental sensitive dumps.
- Prefer server-side allowlist validation over permissive parsing.

---

## 8. Migration Plan
1. Keep `v1` ingest running.
2. Release desktop with dual write (`v1` + local segment/capture logs).
3. Enable `v2` ingest endpoints on backend.
4. Switch desktop upload from `v1` event-only to `v2` segment/capture metadata.
5. Backfill analytics from `telemetry_segments_v2`.
6. Decommission `v1` when dashboards and automation ranking fully rely on v2.

