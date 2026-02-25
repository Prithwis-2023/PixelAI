# Desktop App (Tauri + React) Skeleton

This folder holds the macOS desktop UI shell for DeskOps Copilot.

## Planned modules
- `src/ui/ObserveDashboard.tsx`: Observe mode and daily summary cards
- `src/ui/CandidateList.tsx`: Top 3 automation opportunities
- `src/ui/RunCenter.tsx`: permission, test run, manual/scheduled execution controls

## Notes
- Runtime wiring with Tauri commands and Playwright runner is intentionally deferred to the next implementation slice.
- Core scoring/guard/rollback logic lives in `/packages/core/src`.
