import OperationSummary from './OperationSummary';
import DatasetBox from './DatasetBox';
import FrameGrid from './FrameGrid';
import type { ExtractedFrame } from '../types';

interface MainPanelProps {
  frameCount?: number;
  credits?: number;
  frames?: ExtractedFrame[];
  onExtract?: () => void;
  extractDisabled?: boolean;
}

/** 우측 메인 패널 — 요약 + 데이터셋 박스 + 프레임 그리드 */
export default function MainPanel({
  frameCount = 7,
  credits = 70,
  frames,
  onExtract,
  extractDisabled = false,
}: MainPanelProps) {
  return (
    <main className="flex flex-col flex-1 min-w-0 min-h-0 gap-3">
      <OperationSummary frameCount={frameCount} credits={credits} />
      <DatasetBox onExtract={onExtract} disabled={extractDisabled} />
      <FrameGrid frames={frames} />
    </main>
  );
}
