import { useEffect } from 'react';
import { useObserveStore } from './state/observeStore';

function App() {
  const sessionId = useObserveStore((state) => state.sessionId);
  const permissions = useObserveStore((state) => state.permissions);
  const permissionHint = useObserveStore((state) => state.permissionHint);
  const observationStats = useObserveStore((state) => state.observationStats);
  const lastCapture = useObserveStore((state) => state.lastCapture);
  const lastFlush = useObserveStore((state) => state.lastFlush);
  const logs = useObserveStore((state) => state.logs);
  const loading = useObserveStore((state) => state.loading);
  const refreshPermissions = useObserveStore((state) => state.refreshPermissions);
  const pollObservationStats = useObserveStore((state) => state.pollObservationStats);
  const onStart = useObserveStore((state) => state.onStart);
  const onStop = useObserveStore((state) => state.onStop);
  const onCapture = useObserveStore((state) => state.onCapture);
  const onFlush = useObserveStore((state) => state.onFlush);

  useEffect(() => {
    void refreshPermissions();
    void pollObservationStats();
    const timer = window.setInterval(() => {
      void refreshPermissions();
      void pollObservationStats();
    }, 10000);
    return () => window.clearInterval(timer);
  }, [pollObservationStats, refreshPermissions]);

  const canStart = Boolean(permissions?.accessibility && permissions?.screenRecording);
  const observerActive = Boolean(sessionId);

  return (
    <div className="bg-[#0D1117] text-gray-200 h-screen flex font-sans select-none overflow-hidden">
      <aside className="w-64 bg-[#161B22] border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <span className="text-2xl">🤖</span> DeskOps
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  observerActive ? 'animate-ping bg-green-400' : 'bg-gray-500'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  observerActive ? 'bg-green-500' : 'bg-gray-500'
                }`}
              ></span>
            </span>
            <span className="text-xs font-semibold tracking-wide text-gray-300">
              {observerActive ? `Observer Active (${sessionId})` : 'Observer Idle'}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a
            href="#"
            className="block px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            📊 Dashboard
          </a>
          <a
            href="#"
            className="block px-4 py-2.5 text-sm bg-blue-600/10 text-blue-400 rounded-lg font-bold border border-blue-500/20"
          >
            💡 Opportunities <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded ml-2">3</span>
          </a>
          <a
            href="#"
            className="block px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            ⚡ My Automations
          </a>
          <a
            href="#"
            className="block px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            📋 Audit Logs
          </a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col bg-[#0D1117] overflow-hidden">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-bold text-white">Top Automation Opportunities</h2>
          <div className="text-sm text-gray-400 bg-gray-800/50 px-4 py-1.5 rounded-full border border-gray-700">
            이번 주 예상 절감 시간: <span className="text-green-400 font-bold ml-1">4.5 시간</span>
          </div>
        </header>

        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <div className="bg-[#161B22] border border-gray-800 rounded-xl p-5 mb-6">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="text-sm text-gray-300">
                Hook Status: accessibility=<span className="font-bold text-white">{String(permissions?.accessibility ?? false)}</span>{' '}
                screenRecording=<span className="font-bold text-white">{String(permissions?.screenRecording ?? false)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={loading || observerActive || !canStart}
                  onClick={() => void onStart()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Start Observe
                </button>
                <button
                  disabled={loading || !observerActive}
                  onClick={() => void onStop()}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Stop Observe
                </button>
                <button
                  disabled={loading}
                  onClick={() => void onCapture()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Capture Snapshot
                </button>
                <button
                  disabled={loading}
                  onClick={() => void onFlush()}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Flush Queue
                </button>
                <button
                  disabled={loading}
                  onClick={() => void refreshPermissions()}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Refresh Permissions
                </button>
              </div>
            </div>

            {permissionHint ? (
              <div className="mt-3 text-xs text-amber-300 border border-amber-500/30 bg-amber-500/10 rounded-lg px-3 py-2">
                {permissionHint}
              </div>
            ) : null}

            {lastCapture ? (
              <div className="mt-3 text-xs text-gray-300 bg-[#0D1117] border border-gray-800 rounded-lg p-3">
                <div>Last Capture Ref: <span className="text-white font-semibold">{lastCapture.captureRef}</span></div>
                <div className="truncate">Path: {lastCapture.path}</div>
                <div className="truncate">OCR Summary: {lastCapture.ocrSummary || 'n/a'}</div>
              </div>
            ) : null}

            {lastFlush ? (
              <div className="mt-3 text-xs text-gray-300 bg-[#0D1117] border border-gray-800 rounded-lg p-3">
                <div>
                  Flush: sent=<span className="text-green-400 font-semibold">{lastFlush.sent}</span> failed=
                  <span className="text-red-400 font-semibold">{lastFlush.failed}</span>
                </div>
                <div>
                  validation={lastFlush.validationFailed} duplicate={lastFlush.duplicateFailed} server={lastFlush.serverFailed} network={lastFlush.networkFailed} unknown={lastFlush.unknownFailed}
                </div>
              </div>
            ) : null}

            {observationStats ? (
              <div className="mt-3 text-xs text-gray-300 bg-[#0D1117] border border-gray-800 rounded-lg p-3">
                <div>
                  Local observations: segments=
                  <span className="text-white font-semibold">{observationStats.segmentCount}</span>{' '}
                  captures=<span className="text-white font-semibold">{observationStats.captureCount}</span>
                </div>
                <div>
                  last task hint=
                  <span className="text-blue-300">{observationStats.lastTaskHint ?? 'n/a'}</span> duration=
                  {observationStats.lastSegmentDurationMs ?? 0}ms
                </div>
                <div className="truncate">last capture at={observationStats.lastCaptureAt ?? 'n/a'}</div>
              </div>
            ) : null}
          </div>

          <p className="text-gray-400 mb-6 text-sm">AI가 지난 3일간의 작업 패턴을 분석하여 가장 효율이 높은 자동화를 제안합니다.</p>

          <div className="bg-[#161B22] border border-blue-500/50 rounded-xl p-6 mb-6 shadow-lg shadow-blue-900/10 relative overflow-hidden group hover:border-blue-400 transition-colors">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded border border-blue-500/30 font-bold tracking-wide">
                  🥇 TOP ROI
                </span>
                <h3 className="text-2xl font-bold text-white mt-3 mb-1">Chrome ➡️ Google Sheets 자동 입력</h3>
                <p className="text-sm text-gray-400">
                  브라우저의 주문 데이터를 복사하여 &apos;배송리스트&apos; 시트에 붙여넣는 반복 작업
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-green-400">95%</div>
                <div className="text-xs text-gray-500 font-medium">자동화 성공 확률</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
              <div className="bg-[#0D1117] p-3.5 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-500">⏱️</span>
                  <div className="text-xs text-gray-400 font-medium">예상 절감 시간</div>
                </div>
                <div className="text-sm font-bold text-white">주당 4.5시간</div>
              </div>
              <div className="bg-[#0D1117] p-3.5 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-500">🔐</span>
                  <div className="text-xs text-gray-400 font-medium">필요 권한</div>
                </div>
                <div className="text-sm font-bold text-white truncate">OS 제어, Google OAuth</div>
              </div>
              <div className="bg-[#0D1117] p-3.5 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-500">🛡️</span>
                  <div className="text-xs text-gray-400 font-medium">위험도</div>
                </div>
                <div className="text-sm font-bold text-green-400">Low (민감정보 없음)</div>
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2">
                <span>🚀</span> 자동화 봇 만들기
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 rounded-lg font-bold text-sm border border-gray-700 transition-colors">
                작업 패턴 상세보기
              </button>
            </div>
          </div>

          <div className="bg-[#161B22] border border-gray-800 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-white">Runtime Logs</h3>
              <span className="text-xs text-gray-500">최근 {logs.length}개</span>
            </div>
            <ul className="space-y-2 max-h-56 overflow-auto custom-scrollbar pr-1">
              {logs.length === 0 ? <li className="text-xs text-gray-500">No logs yet.</li> : null}
              {logs.map((log, index) => (
                <li key={`${log}-${index}`} className="text-xs text-gray-300 bg-[#0D1117] border border-gray-800 rounded px-2 py-1.5">
                  {log}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
