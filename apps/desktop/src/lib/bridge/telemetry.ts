import { invoke } from '@tauri-apps/api/tauri';
import type { FlushResult } from '../types/telemetry';

export function flushTelemetryQueue(): Promise<FlushResult> {
  return invoke<FlushResult>('flush_telemetry_queue');
}
