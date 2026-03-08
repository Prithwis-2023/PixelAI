import { SCP } from '../constants';

interface RecBoxProps {
  fileName?: string;
  fileSizeMB?: number;
  onReset?: () => void;
}

/** [REC] 박스 — 파일 정보 표시 + RESET_IDENTIFICATION 버튼 */
export default function RecBox({ fileName = 'INPUT_VIDEO.MP4', fileSizeMB = 1.33, onReset }: RecBoxProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2"
      style={{
        border: '1px solid rgba(255,255,255,0.5)',
        flex: '1 1 0',
        minHeight: 0,
        maxHeight: 'calc(100vh - 80px - 28px - 50px - 12px - 48px - 12px)',
      }}
    >
      <span style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '0.06em', lineHeight: 1, color: 'white', fontFamily: SCP }}>
        [REC]
      </span>

      <div className="text-center" style={{ marginTop: '12px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'white', fontFamily: SCP }}>
          IDENTIFIED: {fileName}
        </p>
        <p style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontFamily: SCP }}>
          SIZE: {fileSizeMB.toFixed(2)}MB
        </p>
      </div>

      <button
        onClick={onReset}
        className="pixel-btn-outline"
        style={{
          marginTop: '14px',
          border: '1px solid #E2FF3B',
          color: '#E2FF3B',
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          padding: '6px 18px',
          background: 'transparent',
          fontFamily: SCP,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        // RESET_IDENTIFICATION
      </button>
    </div>
  );
}
