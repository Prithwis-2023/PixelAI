import { SCP } from '../constants';

/** 더미 로그 엔트리 — 나중에 API 연동 시 실제 job 이벤트로 교체 */
const DUMMY_LOGS = [
  { time: '15:01:03', level: 'INFO',  msg: 'System initialized' },
  { time: '15:01:05', level: 'INFO',  msg: 'Waiting for input...' },
];

const LEVEL_COLOR: Record<string, string> = {
  INFO:  '#E2FF3B',
  WARN:  '#FF9F3B',
  ERROR: '#FF4D4D',
  OK:    '#3BFFB0',
};

interface SystemLogProps {
  logs?: { time: string; level: string; msg: string }[];
}

/** 좌측 하단 시스템 로그 패널 */
export default function SystemLog({ logs = DUMMY_LOGS }: SystemLogProps) {
  return (
    <div
      className="flex flex-col"
      style={{
        border: '1px solid rgba(226,255,59,0.2)',
        background: 'rgba(0,0,0,0.6)',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* 헤더 바 */}
      <div
        style={{
          borderBottom: '1px solid rgba(226,255,59,0.2)',
          padding: '5px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {/* 점멸 인디케이터 */}
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#E2FF3B',
            animation: 'pulse 1.4s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontFamily: SCP,
            fontSize: '9px',
            letterSpacing: '0.14em',
            color: 'rgba(226,255,59,0.5)',
          }}
        >
          // SYSTEM_LOG
        </span>
      </div>

      {/* 로그 리스트 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '6px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {logs.map((entry, i) => (
          <div
            key={i}
            style={{
              fontFamily: SCP,
              fontSize: '9px',
              letterSpacing: '0.04em',
              display: 'flex',
              gap: '8px',
              opacity: 0.85,
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
              {entry.time}
            </span>
            <span
              style={{
                color: LEVEL_COLOR[entry.level] ?? '#fff',
                minWidth: '36px',
              }}
            >
              [{entry.level}]
            </span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{entry.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
