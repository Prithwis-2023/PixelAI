import { useState, useRef, useEffect } from 'react';
import { fetchCurrentUser, getAuthSuccessMessage, loginUser, signupUser } from './api/auth';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import AuthModal from './components/AuthModal';
import PixelBackground from './components/PixelBackground';
import { API_BASE_URL, AUTH_TOKEN_STORAGE_KEY } from './constants';
import { S } from './styles/App.styles';
import type { AppState, AuthMode, AuthenticatedUser, ExtractedFrame } from './types';

interface LogEntry {
  time: string;
  level: string;
  msg: string;
}

export default function App() {
  // ─── Auth
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // ─── App state
  const [appState, setAppState] = useState<AppState>('idle');
  const [tag, setTag] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // ─── Job tracking
  const [jobId, setJobId] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: _ts(), level: 'INFO', msg: 'System initialized' },
    { time: _ts(), level: 'INFO', msg: 'Waiting for input...' },
  ]);

  // SSE ref so we can close on unmount
  const sseRef = useRef<EventSource | null>(null);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function _ts(): string {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }

  function pushLog(level: string, msg: string) {
    setLogs(prev => [...prev, { time: _ts(), level, msg }]);
  }

  function openAuthDialog(mode: AuthMode) {
    setAuthError(null);
    setAuthMode(mode);
  }

  async function handleAuthSubmit({
    mode,
    userLoginId,
    password,
  }: {
    mode: AuthMode;
    userLoginId: string;
    password: string;
  }) {
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (mode === 'signup') {
        await signupUser({ userLoginId, password });
      }

      const token = await loginUser({ userLoginId, password });
      const user = await fetchCurrentUser(token.access_token);

      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token.access_token);
      setCurrentUser(user);
      setAuthMode(null);
      pushLog('SUCCESS', getAuthSuccessMessage(mode, user.user_login_id));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Authentication failed.';
      setAuthError(message);
      pushLog('ERROR', `Authentication failed: ${message}`);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setCurrentUser(null);
    setAuthError(null);
    setAuthMode(null);
    pushLog('INFO', 'Session closed.');
  }

  function openSSE(jid: string) {
    if (sseRef.current) sseRef.current.close();

    const es = new EventSource(`${API_BASE_URL}/stream/${jid}`);
    sseRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as { level: string; msg: string };
        if (data.level === 'DONE') {
          es.close();
          sseRef.current = null;
          checkStatusOnDone(jid);
          return;
        }
        pushLog(data.level, data.msg);
      } catch (_) {}
    };

    es.onerror = () => {
      es.close();
      sseRef.current = null;
    };
  }

  async function checkStatusOnDone(jid: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/status/${jid}`);
      const data = await res.json();
      if (data.label_status === 'done') {
        fetchAnnotatedFrames(jid);
      } else if (data.status === 'done') {
        fetchFrames(jid);
      }
    } catch(e) {}
  }

  async function fetchFrames(jid: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/frames/${jid}`);
      if (!res.ok) return;
      const data = await res.json();
      setFrameCount(data.frame_count ?? 0);
      setFrames((data.frames ?? []) as ExtractedFrame[]);
      setAppState('result');
      pushLog('SUCCESS', `${data.frame_count} frames ready.`);
    } catch (e) {
      pushLog('ERROR', `Failed to fetch frames: ${e}`);
    }
  }

  async function fetchAnnotatedFrames(jid: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/annotated/${jid}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.frames && data.frames.length > 0) {
        setFrames(data.frames as ExtractedFrame[]);
        pushLog('SUCCESS', 'Updated UI with YOLO bounding boxes.');
      }
    } catch(e) {}
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleFileSelect = (file: File) => {
    setVideoFile(file);
    setAppState('idle');
    setFrames([]);
    setFrameCount(0);
    setJobId(null);
    pushLog('INFO', `File selected: ${file.name} (${(file.size / 1048576).toFixed(2)} MB)`);
  };

  const handleExecute = async () => {
    if (!videoFile) {
      pushLog('WARN', 'No video file selected.');
      return;
    }
    if (!tag.trim()) {
      pushLog('WARN', 'Please enter a keyword (e.g. "train", "car").');
      return;
    }

    setAppState('uploading');
    pushLog('INFO', `Uploading ${videoFile.name} with keyword "${tag}"...`);

    try {
      const form = new FormData();
      form.append('video', videoFile);
      form.append('keyword', tag.trim());

      const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const uploadRes = await fetch(`${API_BASE_URL}/upload`, { 
        method: 'POST', 
        body: form,
        headers 
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.detail ?? 'Upload failed');
      }
      const uploadData = await uploadRes.json();
      const jid: string = uploadData.job_id;
      setJobId(jid);
      pushLog('SUCCESS', `Upload complete. Job ID: ${jid}`);

      // 2. Start processing
      setAppState('processing');
      const procRes = await fetch(`${API_BASE_URL}/process/${jid}`, { 
        method: 'POST',
        headers
      });
      if (!procRes.ok) {
        const err = await procRes.json();
        throw new Error(err.detail ?? 'Processing start failed');
      }
      pushLog('INFO', 'Pipeline started...');

      // 3. Open SSE stream
      openSSE(jid);

    } catch (e) {
      setAppState('idle');
      pushLog('ERROR', `Execute failed: ${e}`);
    }
  };

  const handleReset = () => {
    if (sseRef.current) { sseRef.current.close(); sseRef.current = null; }
    setVideoFile(null);
    setJobId(null);
    setFrames([]);
    setFrameCount(0);
    setAppState('idle');
    setTag('');
    setLogs([
      { time: _ts(), level: 'INFO', msg: 'System reset.' },
      { time: _ts(), level: 'INFO', msg: 'Waiting for input...' },
    ]);
  };

  const handleLabel = async () => {
    if (!jobId) return;
    pushLog('INFO', 'Starting YOLO labeling...');
    try {
      const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/label/${jobId}`, { 
        method: 'POST',
        headers
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? 'Labeling failed');
      }
      // Open new SSE for labeling logs
      openSSE(jobId);
    } catch (e) {
      pushLog('ERROR', `Label failed: ${e}`);
    }
  };

  const handleExtract = async () => {
    if (!jobId) {
      pushLog('WARN', 'No job to download from.');
      return;
    }
    try {
      pushLog('INFO', 'Preparing dataset ZIP...');
      const res = await fetch(`${API_BASE_URL}/download/${jobId}`);
      if (!res.ok) {
        // If labeling not done yet, trigger it first
        pushLog('WARN', 'Dataset not ready. Starting labeling first...');
        await handleLabel();
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixel_dataset_${tag}_${jobId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      pushLog('SUCCESS', 'Dataset downloaded.');
    } catch (e) {
      pushLog('ERROR', `Download failed: ${e}`);
    }
  };

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => { sseRef.current?.close(); };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function restoreSession() {
      const storedToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      if (!storedToken) return;

      setAuthLoading(true);
      setAuthError(null);

      try {
        const user = await fetchCurrentUser(storedToken);
        if (!ignore) {
          setCurrentUser(user);
        }
      } catch {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        if (!ignore) {
          setCurrentUser(null);
        }
      } finally {
        if (!ignore) {
          setAuthLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      ignore = true;
    };
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={S.appContainer} style={S.appFont}>
      <PixelBackground />
      <Header
        onOpenLogin={() => openAuthDialog('login')}
        onOpenSignup={() => openAuthDialog('signup')}
        onLogout={handleLogout}
        currentUser={currentUser}
        authBusy={authLoading}
      />

      <div className={S.mainLayout}>
        <div className={S.mainWrapper}>
          <div className={S.sidebarWrapper}>
            <Sidebar
              tag={tag}
              onTagChange={setTag}
              onExecute={handleExecute}
              onReset={handleReset}
              videoFile={videoFile}
              onFileSelect={handleFileSelect}
              logs={logs}
              appState={appState}
            />
          </div>
          <div className={S.contentWrapper}>
            <MainPanel
              frameCount={frameCount}
              frames={frames}
              onExtract={handleExtract}
              extractDisabled={appState !== 'result'}
              keyword={tag}
            />
          </div>
        </div>
      </div>

      {authMode && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
          onSubmit={handleAuthSubmit}
          onClearError={() => setAuthError(null)}
          errorMessage={authError}
          isSubmitting={authLoading}
        />
      )}
    </div>
  );
}
