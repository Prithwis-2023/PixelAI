import { SCP } from '../constants';
import SearchInput from './SearchInput';
import RecBox from './RecBox';

interface SidebarProps {
  tag: string;
  onTagChange: (v: string) => void;
  onExecute?: () => void;
  onReset?: () => void;
}

/** 좌측 패널 — 검색창 + [REC] 박스 + EXECUTE_UPLOAD 버튼 */
export default function Sidebar({ tag, onTagChange, onExecute, onReset }: SidebarProps) {
  return (
    <aside className="shrink-0 flex flex-col gap-3" style={{ width: '230px' }}>

      <SearchInput value={tag} onChange={onTagChange} />

      <RecBox onReset={onReset} />

      {/* EXECUTE_UPLOAD — 글리치 장식 + 노란 채움 버튼 */}
      <div className="shrink-0 relative">
        <div className="absolute bg-[#E2FF3B]" style={{ top: '-3px', left: '10px', width: '12px', height: '3px' }} />
        <div className="absolute bg-[#E2FF3B]" style={{ bottom: '-3px', right: '10px', width: '12px', height: '3px' }} />
        <div className="absolute bg-[#E2FF3B]" style={{ top: '20%', left: '-3px', width: '3px', height: '60%' }} />
        <div className="absolute bg-[#E2FF3B]" style={{ top: '20%', right: '-3px', width: '3px', height: '60%' }} />
        <button
          className="w-full relative z-10"
          onClick={onExecute}
          style={{
            background: '#E2FF3B',
            color: 'black',
            fontWeight: 900,
            fontSize: '10px',
            letterSpacing: '0.14em',
            padding: '10px 0',
            fontFamily: SCP,
            cursor: 'pointer',
            border: 'none',
          }}
        >
          EXECUTE_UPLOAD
        </button>
      </div>
    </aside>
  );
}
