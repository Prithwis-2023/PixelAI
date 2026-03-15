import SearchInput from './SearchInput';
import RecBox from './RecBox';
import SystemLog from './SystemLog';
import { S } from '../styles/Sidebar.styles';

interface SidebarProps {
  tag: string;
  onTagChange: (v: string) => void;
  onExecute?: () => void;
  onReset?: () => void;
}

/** 좌측 패널 — 검색창 + [REC] 박스 + EXECUTE_UPLOAD 버튼 + 시스템 로그 */
export default function Sidebar({ tag, onTagChange, onExecute, onReset }: SidebarProps) {
  return (
    <aside className={S.container}>

      <SearchInput value={tag} onChange={onTagChange} />

      <RecBox onReset={onReset} />

      {/* EXECUTE_UPLOAD — 글리치 장식 + 노란 채움 버튼 */}
      <div className={S.executeBtnWrapper}>
        <div className="absolute" style={S.glitchTopLeft} />
        <div className="absolute" style={S.glitchBottomRight} />
        <div className="absolute" style={S.glitchLeft} />
        <div className="absolute" style={S.glitchRight} />
        <button
          className={S.executeBtn}
          onClick={onExecute}
          style={S.executeBtnStyle}
        >
          EXECUTE_UPLOAD
        </button>
      </div>

      {/* 시스템 로그 — 남은 공간 채움 */}
      <div className={S.logContainer}>
        <SystemLog />
      </div>

    </aside>
  );
}
