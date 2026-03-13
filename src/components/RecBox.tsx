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
      className="flex flex-col items-center justify-center gap-2 p-4 min-w-0"
      style={{
        border: '1px solid rgba(255,255,255,0.5)',
        flex: '1 1 auto',
        minHeight: '150px',
      }}
    >
      <span className="text-[32px] md:text-[40px] font-black tracking-[0.06em] leading-none text-white break-words text-center" style={{ fontFamily: SCP }}>
        [REC]
      </span>

      <div className="text-center mt-3 min-w-0 w-full px-2">
        <p className="text-[10px] font-bold tracking-[0.12em] text-white break-all line-clamp-2" style={{ fontFamily: SCP }}>
          IDENTIFIED: {fileName}
        </p>
        <p className="text-[9px] tracking-[0.12em] text-white/40 mt-1 break-words" style={{ fontFamily: SCP }}>
          SIZE: {fileSizeMB.toFixed(2)}MB
        </p>
      </div>

      <button
        onClick={onReset}
        className="pixel-btn-outline mt-3 border border-[#E2FF3B] text-[#E2FF3B] text-[9px] font-bold tracking-[0.08em] px-4 py-2 hover:bg-[#E2FF3B] hover:text-black transition-colors break-words text-center max-w-full leading-tight"
        style={{ fontFamily: SCP }}
      >
        // RESET_IDENTIFICATION
      </button>
    </div>
  );
}
