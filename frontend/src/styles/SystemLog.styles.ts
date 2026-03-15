import { SCP } from '../constants';

export const LEVEL_COLOR: Record<string, string> = {
  INFO:  '#2DEBA9',
  WARN:  '#FF9F3B',
  ERROR: '#FF4D4D',
  OK:    '#3BFFB0',
};

export const S = {
  container: "flex flex-col",
  containerStyle: {
    border: '1px solid rgba(45,235,169,0.2)',
    background: 'rgba(0,0,0,0.6)',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden' as const,
  },

  header: {
    borderBottom: '1px solid rgba(45,235,169,0.2)',
    padding: '5px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  
  indicator: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#2DEBA9',
    animation: 'pulse 1.4s ease-in-out infinite',
  },
  
  headerTitle: {
    fontFamily: SCP,
    fontSize: '9px',
    letterSpacing: '0.14em',
    color: 'rgba(45,235,169,0.5)',
  },

  logList: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '6px 10px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },

  entryRecord: {
    fontFamily: SCP,
    fontSize: '9px',
    letterSpacing: '0.04em',
    display: 'flex',
    gap: '8px',
    opacity: 0.85,
  },
  
  entryTime: { color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' as const },
  entryLevel: (level: string) => ({
    color: LEVEL_COLOR[level] ?? '#fff',
    minWidth: '36px',
  }),
  entryMsg: { color: 'rgba(255,255,255,0.7)' },
};
