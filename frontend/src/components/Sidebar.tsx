import SearchInput from './SearchInput';
import RecBox from './RecBox';
import SystemLog from './SystemLog';
import { S } from '../styles/Sidebar.styles';
import type { AppState } from '../types';

interface LogEntry {
  time: string;
  level: string;
  msg: string;
}

interface SidebarProps {
  tag: string;
  onTagChange: (v: string) => void;
  onExecute?: () => void;
  onReset?: () => void;
  videoFile?: File | null;
  onFileSelect?: (file: File) => void;
  logs?: LogEntry[];
  appState?: AppState;
}

export default function Sidebar({
  tag,
  onTagChange,
  onExecute,
  onReset,
  videoFile,
  onFileSelect,
  logs,
  appState,
}: SidebarProps) {
  const isProcessing = appState === 'uploading' || appState === 'processing';

  return (
    <aside className={S.container}>

      <SearchInput value={tag} onChange={onTagChange} />

      <RecBox
        fileName={videoFile?.name}
        fileSizeMB={videoFile ? videoFile.size / 1048576 : undefined}
        onReset={onReset}
        onFileSelect={onFileSelect}
      />

      {/* EXECUTE_UPLOAD */}
      <div className={S.executeBtnWrapper}>
        <div className="absolute" style={S.glitchTopLeft} />
        <div className="absolute" style={S.glitchBottomRight} />
        <div className="absolute" style={S.glitchLeft} />
        <div className="absolute" style={S.glitchRight} />
        <button
          className={S.executeBtn}
          onClick={onExecute}
          disabled={isProcessing}
          style={{
            ...S.executeBtnStyle,
            opacity: isProcessing ? 0.5 : 1,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
          }}
        >
          {isProcessing ? 'PROCESSING...' : 'EXECUTE_UPLOAD'}
        </button>
      </div>

      {/* System log */}
      <div className={S.logContainer}>
        <SystemLog logs={logs} />
      </div>

    </aside>
  );
}
