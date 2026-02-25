# Desktop App (Tauri + React)

Local-first desktop capture agent for DeskOps Copilot. Screenshot/OCR processing runs locally and
only metadata is sent to backend.

## Commands
- `npm run build`: TypeScript + Vite build
- `npm run tauri -- dev --no-watch`: run desktop app in development
- `npm run smoke:backend`: verify backend contract only (`/health`, telemetry `202/409/400`)
- `npm run smoke:e2e`: auto-start local backend (if needed) then run smoke checks

## Runtime Env (Desktop)
- `DESKOPS_BACKEND_URL`: backend base URL (default `http://localhost:4310`)
- `DESKOPS_FLUSH_INTERVAL_SECONDS`: periodic queue flush interval during observe loop (default `15`)
- `DESKOPS_CAPTURE_COOLDOWN_SECONDS`: screenshot cooldown on state change (default `5`)

## Required macOS Permissions
- Accessibility
- Screen Recording

Observe start and manual capture are blocked when required permissions are missing.
