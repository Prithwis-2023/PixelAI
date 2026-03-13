import { SCP } from '../constants';

interface DatasetBoxProps {
  onExtract?: () => void;
  disabled?: boolean;
}

/** AI 학습 번들 정보 + EXTRACT_DATASET.ZIP 버튼 */
export default function DatasetBox({ onExtract, disabled = false }: DatasetBoxProps) {
  return (
    <div
      className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center relative gap-4 sm:gap-0"
      style={{ 
        padding: '16px 20px',
        backgroundColor: 'rgba(226,255,59,0.02)',
        boxShadow: 'inset 0 0 0 1px rgba(226,255,59,0.3)',
      }}
    >
      {/* 8-bit decorative corners */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#E2FF3B]" />
      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#E2FF3B]" />
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-[#E2FF3B]" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#E2FF3B]" />

      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'white', letterSpacing: '0.04em', fontFamily: SCP }}>
          AI _TRAINING_BUNDLE_GENERIC
        </p>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', letterSpacing: '0.1em', fontFamily: SCP }}>
          FORMAT: YOLOV8// READY FOR OPTIMIZATION
        </p>
      </div>

      {/* EXTRACT 버튼 + 글리치 장식 */}
      <div className="relative shrink-0 pixel-btn-primary" style={{ marginLeft: '16px' }}>
        <div className="absolute bg-[#E2FF3B]" style={{ top: '-3px', left: '8px', width: '10px', height: '3px' }} />
        <div className="absolute bg-[#E2FF3B]" style={{ bottom: '-3px', right: '8px', width: '10px', height: '3px' }} />
        <div className="absolute bg-[#E2FF3B]" style={{ top: '15%', right: '-3px', width: '3px', height: '70%' }} />
        <button
          className="relative z-10 w-full h-full flex items-center justify-center leading-none"
          onClick={onExtract}
          disabled={disabled}
          style={{
            background: disabled ? 'rgba(226,255,59,0.4)' : '#E2FF3B',
            color: 'black',
            fontWeight: 900,
            fontSize: '9px',
            letterSpacing: '0.1em',
            padding: '8px 20px',
            fontFamily: SCP,
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: 'none',
          }}
        >
          EXTRACT_DATASET.ZIP
        </button>
      </div>
    </div>
  );
}
