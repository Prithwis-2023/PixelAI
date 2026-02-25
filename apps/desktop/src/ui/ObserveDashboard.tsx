import { useEffect } from 'react';
import { useObserveStore } from '../state/observeStore';

export default function ObserveDashboard() {
  const sessionId = useObserveStore((state) => state.sessionId);
  const permissions = useObserveStore((state) => state.permissions);
  const permissionHint = useObserveStore((state) => state.permissionHint);
  const lastCapture = useObserveStore((state) => state.lastCapture);
  const loading = useObserveStore((state) => state.loading);
  const refreshPermissions = useObserveStore((state) => state.refreshPermissions);
  const onStart = useObserveStore((state) => state.onStart);
  const onStop = useObserveStore((state) => state.onStop);
  const onCapture = useObserveStore((state) => state.onCapture);
  const canStart = Boolean(permissions?.accessibility && permissions?.screenRecording);

  useEffect(() => {
    void refreshPermissions();
  }, [refreshPermissions]);

  return (
    <section className="card">
      <h2>Observe Dashboard</h2>
      <div className="status-row">
        <span className="status-badge">session: {sessionId ?? 'idle'}</span>
        <span className="status-badge">accessibility: {String(permissions?.accessibility ?? false)}</span>
        <span className="status-badge">screen recording: {String(permissions?.screenRecording ?? false)}</span>
      </div>
      <div className="status-row">
        <button disabled={loading || Boolean(sessionId) || !canStart} onClick={() => void onStart()}>
          Start Observe
        </button>
        <button disabled={loading || !sessionId} onClick={() => void onStop()}>
          Stop Observe
        </button>
        <button disabled={loading} onClick={() => void onCapture()}>
          Capture Snapshot
        </button>
        <button disabled={loading} onClick={() => void refreshPermissions()}>
          Refresh Permissions
        </button>
      </div>
      {permissionHint ? (
        <div className="warning-box">
          {permissionHint}
        </div>
      ) : null}
      {lastCapture ? (
        <p>
          Last capture: <code>{lastCapture.captureRef}</code> | OCR: <code>{lastCapture.ocrSummary || 'n/a'}</code>
        </p>
      ) : null}
    </section>
  );
}
