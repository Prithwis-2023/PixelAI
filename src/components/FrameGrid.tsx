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
        {frames.map((frame) => {
          // GitHub 잔디(Contribution graph) 감성의 투명도 설정 (난수적 차이)
          const opacities = [0.15, 0.35, 0.55, 0.8, 1];
          const opacity = frame.url ? 1 : opacities[(frame.id * 7) % opacities.length];

          return frame.url ? (
            <img
              key={frame.id}
              src={frame.url}
              alt={`FRAME_${String(frame.id).padStart(3, '0')}`}
              className="w-full h-full object-cover min-h-0 pixel-frame border border-[#E2FF3B]/50"
            />
          ) : (
            <div 
              key={frame.id} 
              className="min-h-0 pixel-frame"
              style={{
                backgroundColor: `rgba(226,255,59,${opacity})`,
                boxShadow: `inset 0 0 0 1px rgba(226,255,59,${opacity + 0.2})`, // 8-bit inner border highlight
              }} 
            />
          );
        })}
      </div>
    </div>
  );
}
