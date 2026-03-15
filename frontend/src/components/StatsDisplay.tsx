import { S } from '../styles/StatsDisplay.styles';

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
  { label: 'RELEVANCE_SCORE',  value: 91, max: 100, color: '#2DEBA9' },
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
    <div style={S.donutContainer}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={circ * 0.25}
          style={{ filter: S.donutSvg.filter(color) }}
        />
        <text x="50" y="46" textAnchor="middle" fill={color} style={S.donutValueText}>
          {value}
        </text>
        <text x="50" y="60" textAnchor="middle" style={S.donutMaxText}>
          / {max}
        </text>
      </svg>
      <span style={S.donutLabelText}>
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

  const fillPath = [
    `M ${xs[0]},${ys[0]}`,
    ...xs.slice(1).map((x, i) => `L ${x},${ys[i + 1]}`),
    `L ${xs[xs.length - 1]},${H - PAD}`,
    `L ${xs[0]},${H - PAD}`,
    'Z',
  ].join(' ');

  return (
    <div style={S.lineChartContainer}>
      <p style={S.lineChartTitle}>
        // RELEVANCE_TREND
      </p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={S.lineChartSvgStyle}>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2DEBA9" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2DEBA9" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1.0].map(v => {
          const y = PAD + (1 - v) * (H - PAD * 2);
          return (
            <g key={v}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={PAD - 4} y={y + 4} textAnchor="end" style={S.lineChartGuidelineText}>
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}

        <path d={fillPath} fill="url(#lg)" />

        <polyline
          points={polyline}
          fill="none"
          stroke="#2DEBA9"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={S.lineChartPolylineStyle}
        />

        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={ys[i]} r="3.5" fill="#000" stroke="#2DEBA9" strokeWidth="1.5" />
            <text x={x} y={H - 4} textAnchor="middle" style={S.lineChartDataText}>
              {data[i].label.replace('FRAME_', 'F')}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function StatsDisplay({
  stats = DEFAULT_STATS,
  chartData = DEFAULT_CHART,
}: StatsDisplayProps) {
  return (
    <div className={S.mainContainer}>
      <p style={S.mainTitle}>
        // ANALYSIS_RESULT
      </p>

      {/* 도넛 차트 행 */}
      <div style={S.donutChartsRow}>
        {stats.map(s => (
          <DonutChart key={s.label} {...s} />
        ))}
      </div>

      {/* 구분선 */}
      <div style={S.divider} />

      {/* 라인 차트 */}
      <div style={S.lineChartArea}>
        <LineChart data={chartData} />
      </div>
    </div>
  );
}
