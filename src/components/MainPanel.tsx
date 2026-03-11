import OperationSummary from './OperationSummary';
import DatasetBox from './DatasetBox';
import StatsDisplay from './StatsDisplay';
import type { ExtractedFrame } from '../types';

interface MainPanelProps {
  frameCount?: number;
  credits?: number;
  frames?: ExtractedFrame[];
  onExtract?: () => void;
  extractDisabled?: boolean;
}

/** 우측 메인 패널 — 요약 + 데이터셋 박스 + 통계 차트 */
export default function MainPanel({
  frameCount = 7,
  credits = 70,
  onExtract,
  extractDisabled = false,
}: MainPanelProps) {
  return (
    <main className="flex flex-col min-w-0 min-h-0 gap-3" style={{ flex: '1 1 0', maxWidth: '560px' }}>
      <OperationSummary frameCount={frameCount} credits={credits} />
      <DatasetBox onExtract={onExtract} disabled={extractDisabled} />
      <StatsDisplay />
    </main>
  );
}
