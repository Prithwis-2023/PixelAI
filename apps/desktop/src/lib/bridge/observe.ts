import { invoke } from '@tauri-apps/api/tauri';
import type { CaptureSnapshotResult, ObserveSession } from '../types/telemetry';

export function startObserve(): Promise<ObserveSession> {
  return invoke<ObserveSession>('start_observe');
}

export function stopObserve(): Promise<{ stopped: boolean }> {
  return invoke<{ stopped: boolean }>('stop_observe');
}

export function captureSnapshot() {
  return invoke<CaptureSnapshotResult>('capture_snapshot');
}
