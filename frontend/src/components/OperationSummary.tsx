

import { S } from '../styles/OperationSummary.styles';

interface OperationSummaryProps {
  frameCount?: number;
  credits?: number;
}

/** 상단 요약 — DATA_SAVED 프레임 수 + REWARDS ISSUED 크레딧 */
export default function OperationSummary({ frameCount = 7, credits = 70 }: OperationSummaryProps) {
  return (
    <div className={S.container}>
      <div className={S.leftBlock}>
        <p style={S.opsLabel}>
          OPERATION SUMMARY
        </p>
        <h2 style={S.dataSaved}>
          DATA_SAVED: {frameCount} FRAMES
        </h2>
      </div>
      <div className={S.rightBlock}>
        <p style={S.rewardLabel}>
          REWARDS ISSUED
        </p>
        <p style={S.credits}>
          +{credits} CR
        </p>
      </div>
    </div>
  );
}
