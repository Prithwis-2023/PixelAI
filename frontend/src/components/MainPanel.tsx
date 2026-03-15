import OperationSummary from './OperationSummary';
import DatasetBox from './DatasetBox';
import StatsDisplay from './StatsDisplay';
import type { ExtractedFrame, AppState } from '../types';
import { S } from '../styles/MainPanel.styles';
import FrameGrid from './FrameGrid';
import TrainingVisualizer from './TrainingVisualizer';
import type { TrainingMetrics } from '../types';

interface MainPanelProps {
  frameCount?: number;
  frames?: ExtractedFrame[];
  onExtract?: () => void;
  extractDisabled?: boolean;
  appState?: AppState;
  keyword?: string;
  onTrain?: () => void;
  trainDisabled?: boolean;
  metrics?: TrainingMetrics | null;
}

export default function MainPanel({
  frameCount = 0,
  frames = [],
  onExtract,
  extractDisabled = false,
  keyword = '',
  onTrain,
  trainDisabled = false,
  metrics = null,
}: MainPanelProps) {
  const credits = frameCount * 10;

  return (
    <main className={S.container}>
      <OperationSummary frameCount={frameCount} credits={credits} />
      <DatasetBox 
        onExtract={onExtract} 
        disabled={extractDisabled} 
        trainDisabled={trainDisabled}
        keyword={keyword}
        onTrain={onTrain}
        extractLabel={metrics ? 'EXTRACT_DATASET.ZIP' : 'LABEL DATA'}
      />
      <div className={S.statsContainer}>
        {metrics ? (
          <TrainingVisualizer metrics={metrics} />
        ) : frames.length > 0 ? (
          <FrameGrid frames={frames} />
        ) : (
          <StatsDisplay />
        )}
      </div>
    </main>
  );
}
