import { SCP } from '../constants';

/* ─── 타입 ─── */
interface StatEntry {
  label: string;
  value: number;
  max: number;
  color: string;
}

interface StatsDisplayProps {
  /** 도넛 차트 통계 (더미 or API 연동) */
  stats?: StatEntry[];
  /** 라인 그래프 데이터 포인트 */
  chartData?: { label: string; value: number }[];
}

/* ─── 기본 더미 데이터 ─── */
const DEFAULT_STATS: StatEntry[] = [
  { label: 'RELEVANCE_SCORE',  value: 91, max: 100, color: '#E2FF3B' },
  { label: 'ANNOTATION_CONF',  value: 76, max: 100, color: '#3BFFE0' },
];

const DEFAULT_CHART: { label: string; value: number }[] = [
  { label: 'FRAME_01', value: 0.91 },
  { label: 'FRAME_02', value: 0.76 },
  { label: 'FRAME_03', value: 0.84 },
  { label: 'FRAME_04', value: 0.62 },
  { label: 'FRAME_05', value: 0.88 },
  { label: 'FRAME_06', value: 0.95 },
];

/* ─── 도넛 차트 ─── */
function DonutChart({ value, max, color, label }: StatEntry) {
  const pct = value / max;
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const gap  = circ - dash;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* 배경 링 */}
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        {/* 진행 링 */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={circ * 0.25}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
        {/* 중앙 텍스트 */}
        <text x="50" y="46" textAnchor="middle" fill={color} fontSize="16" fontWeight="900" fontFamily={SCP}>
          {value}
        </text>
        <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily={SCP}>
          / {max}
        </text>
      </svg>
      <span style={{ fontFamily: SCP, fontSize: '8px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </span>
    </div>
  );
}

/* ─── 미니 라인 차트 ─── */
function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 420, H = 120, PAD = 20;
  const xs = data.map((_, i) => PAD + (i / (data.length - 1)) * (W - PAD * 2));
  const ys = data.map(d => PAD + (1 - d.value) * (H - PAD * 2));

  const polyline = xs.map((x, i) => `${x},${ys[i]}`).join(' ');

  // 그라디언트 fill path
  const fillPath = [
    `M ${xs[0]},${ys[0]}`,
    ...xs.slice(1).map((x, i) => `L ${x},${ys[i + 1]}`),
    `L ${xs[xs.length - 1]},${H - PAD}`,
    `L ${xs[0]},${H - PAD}`,
    'Z',
  ].join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <p style={{ fontFamily: SCP, fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
        // RELEVANCE_TREND
      </p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E2FF3B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#E2FF3B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 수평 가이드라인 */}
        {[0.25, 0.5, 0.75, 1.0].map(v => {
          const y = PAD + (1 - v) * (H - PAD * 2);
          return (
            <g key={v}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={PAD - 4} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily={SCP}>
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* 그라디언트 채움 */}
        <path d={fillPath} fill="url(#lg)" />

        {/* 라인 */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#E2FF3B"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px #E2FF3B88)' }}
        />

        {/* 데이터 포인트 */}
        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={ys[i]} r="3.5" fill="#000" stroke="#E2FF3B" strokeWidth="1.5" />
            <text x={x} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily={SCP}>
              {data[i].label.replace('FRAME_', 'F')}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
/** 
 * 추출 결과 통계 패널 — 도넛 차트 + 라인 그래프
 * 백엔드 연동 시 실제 Job frame relevance/confidence 데이터로 교체
 */
export default function StatsDisplay({
  stats = DEFAULT_STATS,
  chartData = DEFAULT_CHART,
}: StatsDisplayProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 gap-5">
      <p style={{ fontFamily: SCP, fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', margin: 0 }}>
        // ANALYSIS_RESULT
      </p>

      {/* 도넛 차트 행 */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', justifyContent: 'center' }}>
        {stats.map(s => (
          <DonutChart key={s.label} {...s} />
        ))}
      </div>

      {/* 구분선 */}
      <div style={{ borderTop: '1px solid rgba(226,255,59,0.12)' }} />

      {/* 라인 차트 */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <LineChart data={chartData} />
      </div>
    </div>
  );
}
