import { S } from '../styles/FrameGrid.styles';
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
    <div className={S.container}>
      <p className={S.titleText} style={S.titleStyle}>
        // INSPECTED_DATA_STREAM
      </p>
      <div className={S.gridContainer} style={S.gridStyle}>
        {frames.map((frame) => {
          // GitHub 잔디(Contribution graph) 감성의 투명도 설정 (난수적 차이)
          const opacities = [0.15, 0.35, 0.55, 0.8, 1];
          const opacity = frame.url ? 1 : opacities[(frame.id * 7) % opacities.length];

          return frame.url ? (
            <img
              key={frame.id}
              src={frame.url}
              alt={`FRAME_${String(frame.id).padStart(3, '0')}`}
              className={S.imageProps}
            />
          ) : (
            <div 
              key={frame.id} 
              className={S.dummyWrapper}
              style={S.dummyStyle(opacity)} 
            />
          );
        })}
      </div>
    </div>
  );
}
