import { S } from '../styles/SystemLog.styles';

/** 더미 로그 엔트리 — 나중에 API 연동 시 실제 job 이벤트로 교체 */
const DUMMY_LOGS = [
  { time: '15:01:03', level: 'INFO',  msg: 'System initialized' },
  { time: '15:01:05', level: 'INFO',  msg: 'Waiting for input...' },
];

interface SystemLogProps {
  logs?: { time: string; level: string; msg: string }[];
}

/** 좌측 하단 시스템 로그 패널 */
export default function SystemLog({ logs = DUMMY_LOGS }: SystemLogProps) {
  return (
    <div className={S.container} style={S.containerStyle}>
      {/* 헤더 바 */}
      <div style={S.header}>
        <span style={S.indicator} />
        <span style={S.headerTitle}>
          // SYSTEM_LOG
        </span>
      </div>

      {/* 로그 리스트 */}
      <div style={S.logList}>
        {logs.map((entry, i) => (
          <div key={i} style={S.entryRecord}>
            <span style={S.entryTime}>
              {entry.time}
            </span>
            <span style={S.entryLevel(entry.level)}>
              [{entry.level}]
            </span>
            <span style={S.entryMsg}>{entry.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
