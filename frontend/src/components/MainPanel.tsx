import OperationSummary from './OperationSummary';
import DatasetBox from './DatasetBox';
import StatsDisplay from './StatsDisplay';
import type { ExtractedFrame, AppState } from '../types';
import { S } from '../styles/MainPanel.styles';
import FrameGrid from './FrameGrid';

interface MainPanelProps {
  frameCount?: number;
  frames?: ExtractedFrame[];
  onExtract?: () => void;
  extractDisabled?: boolean;
  appState?: AppState;
  keyword?: string;
}

export default function MainPanel({
  frameCount = 0,
  frames = [],
  onExtract,
  extractDisabled = false,
  keyword = '',
}: MainPanelProps) {
  const credits = frameCount * 10;

  return (
    <main className={S.container}>
      <OperationSummary frameCount={frameCount} credits={credits} />
      <DatasetBox onExtract={onExtract} disabled={extractDisabled} keyword={keyword} />
      <div className={S.statsContainer}>
        {frames.length > 0 ? (
          <FrameGrid frames={frames} />
        ) : (
          <StatsDisplay />
        )}
      </div>
    </main>
  );
}
