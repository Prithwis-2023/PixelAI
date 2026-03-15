import { useEffect, useRef } from 'react';
import { S } from '../styles/SystemLog.styles';

const DUMMY_LOGS = [
  { time: '00:00:00', level: 'INFO', msg: 'System initialized' },
  { time: '00:00:01', level: 'INFO', msg: 'Waiting for input...' },
];

interface LogEntry {
  time: string;
  level: string;
  msg: string;
}

interface SystemLogProps {
  logs?: LogEntry[];
}

export default function SystemLog({ logs = DUMMY_LOGS }: SystemLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className={S.container} style={S.containerStyle}>
      {/* Header bar */}
      <div style={S.header}>
        <span style={S.indicator} />
        <span style={S.headerTitle}>// SYSTEM_LOG</span>
      </div>

      {/* Log list */}
      <div style={S.logList}>
        {logs.map((entry, i) => (
          <div key={i} style={S.entryRecord}>
            <span style={S.entryTime}>{entry.time}</span>
            <span style={S.entryLevel(entry.level)}>[{entry.level}]</span>
            <span style={S.entryMsg}>{entry.msg}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
