import { invoke } from '@tauri-apps/api/tauri';
import type { PermissionState } from '../types/telemetry';

export function checkPermissions(): Promise<PermissionState> {
  return invoke<PermissionState>('check_permissions');
}
