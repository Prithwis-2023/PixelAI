import { SCP } from '../constants';
import type { ExtractedFrame } from '../types';

interface FrameGridProps {
  frames?: ExtractedFrame[];
}

// 더미 프레임 9개 (백엔드 연동 전 사용)
const DUMMY_FRAMES: ExtractedFrame[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  url: '',
}));

/** 추출된 프레임 9개 3×3 그리드 */
export default function FrameGrid({ frames = DUMMY_FRAMES }: FrameGridProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <p
        className="shrink-0"
        style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em', marginBottom: '6px', fontFamily: SCP }}
      >
        // INSPECTED_DATA_STREAM
      </p>
      <div
        className="flex-1 min-h-0 grid grid-cols-3"
        style={{ gap: '10px', gridTemplateRows: 'repeat(3, 1fr)' }}
      >
        {frames.map((frame) =>
          frame.url ? (
            <img
              key={frame.id}
              src={frame.url}
              alt={`FRAME_${String(frame.id).padStart(3, '0')}`}
              className="w-full h-full object-cover min-h-0"
            />
          ) : (
            <div key={frame.id} className="bg-[#E2FF3B] min-h-0" />
          )
        )}
      </div>
    </div>
  );
}
