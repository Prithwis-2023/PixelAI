import { useObserveStore } from '../state/observeStore';

export default function RunCenter() {
  const logs = useObserveStore((state) => state.logs);
  const lastFlush = useObserveStore((state) => state.lastFlush);
  const loading = useObserveStore((state) => state.loading);
  const onFlush = useObserveStore((state) => state.onFlush);

  return (
    <section className="card">
      <h2>Run Center</h2>
      <div className="status-row">
        <button disabled={loading} onClick={() => void onFlush()}>
          Flush Telemetry Queue
        </button>
        {lastFlush ? (
          <span className="status-badge">
            sent={lastFlush.sent} failed={lastFlush.failed} (validation={lastFlush.validationFailed}, duplicate=
            {lastFlush.duplicateFailed}, server={lastFlush.serverFailed}, network={lastFlush.networkFailed}, unknown=
            {lastFlush.unknownFailed})
          </span>
        ) : null}
      </div>
      <ul className="log-list">
        {logs.map((log, index) => (
          <li key={`${log}-${index}`}>{log}</li>
        ))}
      </ul>
    </section>
  );
}
