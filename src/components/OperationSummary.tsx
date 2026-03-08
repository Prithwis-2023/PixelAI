import { SCP } from '../constants';

interface OperationSummaryProps {
  frameCount?: number;
  credits?: number;
}

/** 상단 요약 — DATA_SAVED 프레임 수 + REWARDS ISSUED 크레딧 */
export default function OperationSummary({ frameCount = 7, credits = 70 }: OperationSummaryProps) {
  return (
    <div className="flex justify-between items-start shrink-0">
      <div>
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', marginBottom: '4px', fontFamily: SCP }}>
          OPERATION SUMMARY
        </p>
        <h2 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '0.06em', lineHeight: 1, color: 'white', fontFamily: SCP, whiteSpace: 'nowrap' }}>
          DATA_SAVED: {frameCount} FRAMES
        </h2>
      </div>
      <div className="text-right shrink-0" style={{ paddingLeft: '20px' }}>
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', marginBottom: '4px', fontFamily: SCP }}>
          REWARDS ISSUED
        </p>
        <p style={{ fontSize: '22px', fontWeight: 900, color: '#E2FF3B', lineHeight: 1, fontFamily: SCP, whiteSpace: 'nowrap' }}>
          +{credits} CR
        </p>
      </div>
    </div>
  );
}
