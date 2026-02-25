export type TelemetryResult = 'success' | 'failed' | 'review';

export interface TelemetryEventPayload {
  eventId: string;
  occurredAt: string;
  category: string;
  result: TelemetryResult;
  source?: string;
}

export interface PermissionState {
  accessibility: boolean;
  screenRecording: boolean;
}

export interface CaptureSnapshotResult {
  captureRef: string;
  path: string;
  ocrSummary: string;
}

export interface FlushResult {
  sent: number;
  failed: number;
  validationFailed: number;
  duplicateFailed: number;
  serverFailed: number;
  networkFailed: number;
  unknownFailed: number;
}

export interface ObserveSession {
  sessionId: string;
}
