import { create } from 'zustand';
import type { CaptureSnapshotResult, FlushResult, PermissionState } from '../lib/types/telemetry';
import { startObserve, stopObserve, captureSnapshot } from '../lib/bridge/observe';
import { checkPermissions } from '../lib/bridge/permissions';
import { flushTelemetryQueue } from '../lib/bridge/telemetry';

interface ObserveState {
  sessionId: string | null;
  permissions: PermissionState | null;
  permissionHint: string | null;
  lastCapture: CaptureSnapshotResult | null;
  lastFlush: FlushResult | null;
  logs: string[];
  loading: boolean;
  refreshPermissions: () => Promise<void>;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onCapture: () => Promise<void>;
  onFlush: () => Promise<void>;
}

function addLog(logs: string[], entry: string): string[] {
  return [entry, ...logs].slice(0, 100);
}

export const useObserveStore = create<ObserveState>((set) => ({
  sessionId: null,
  permissions: null,
  permissionHint: null,
  lastCapture: null,
  lastFlush: null,
  logs: [],
  loading: false,
  refreshPermissions: async () => {
    try {
      const permissions = await checkPermissions();
      set((state) => ({
        permissions,
        permissionHint: getPermissionHint(permissions),
        logs: addLog(
          state.logs,
          `permission check: accessibility=${permissions.accessibility} screenRecording=${permissions.screenRecording}`
        )
      }));
    } catch (error) {
      set((state) => ({ logs: addLog(state.logs, `permission check failed: ${String(error)}`) }));
    }
  },
  onStart: async () => {
    set({ loading: true });
    try {
      const permissions = await checkPermissions();
      if (!permissions.accessibility || !permissions.screenRecording) {
        set((state) => ({
          permissions,
          permissionHint: getPermissionHint(permissions),
          logs: addLog(state.logs, 'start blocked: required macOS permissions are missing'),
          loading: false
        }));
        return;
      }
      const response = await startObserve();
      set((state) => ({
        sessionId: response.sessionId,
        permissionHint: null,
        logs: addLog(state.logs, `observe started: ${response.sessionId}`),
        loading: false
      }));
    } catch (error) {
      set((state) => ({
        logs: addLog(state.logs, `start failed: ${formatErrorMessage(error)}`),
        loading: false
      }));
    }
  },
  onStop: async () => {
    set({ loading: true });
    try {
      const response = await stopObserve();
      set((state) => ({
        sessionId: response.stopped ? null : state.sessionId,
        logs: addLog(state.logs, `observe stopped=${response.stopped}`),
        loading: false
      }));
    } catch (error) {
      set((state) => ({ logs: addLog(state.logs, `stop failed: ${String(error)}`), loading: false }));
    }
  },
  onCapture: async () => {
    set({ loading: true });
    try {
      const result = (await captureSnapshot()) as CaptureSnapshotResult;
      set((state) => ({
        lastCapture: result,
        logs: addLog(state.logs, `capture completed: ${result.captureRef}`),
        loading: false
      }));
    } catch (error) {
      set((state) => ({ logs: addLog(state.logs, `capture failed: ${String(error)}`), loading: false }));
    }
  },
  onFlush: async () => {
    set({ loading: true });
    try {
      const result = await flushTelemetryQueue();
      const breakdown = `validation=${result.validationFailed} duplicate=${result.duplicateFailed} server=${result.serverFailed} network=${result.networkFailed} unknown=${result.unknownFailed}`;
      set((state) => ({
        lastFlush: result,
        logs: addLog(
          state.logs,
          `flush completed: sent=${result.sent} failed=${result.failed} (${breakdown})`
        ),
        loading: false
      }));
    } catch (error) {
      set((state) => ({ logs: addLog(state.logs, `flush failed: ${String(error)}`), loading: false }));
    }
  }
}));

function getPermissionHint(permissions: PermissionState): string | null {
  const missing: string[] = [];
  if (!permissions.accessibility) {
    missing.push('Accessibility');
  }
  if (!permissions.screenRecording) {
    missing.push('Screen Recording');
  }
  if (missing.length === 0) {
    return null;
  }
  return `Grant ${missing.join(', ')} in System Settings > Privacy & Security before starting Observe.`;
}

function formatErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
