import { SCP } from '../constants';

/** 픽셀 도트 테두리 로고 + PIXEL 텍스트 + SYSTEM STATUS */
export default function Header() {
  return (
    <header
      className="shrink-0 flex items-center gap-5 px-8 border-b border-[#E2FF3B]"
      style={{ height: '80px' }}
    >
      {/* 픽셀 도트 로고 */}
      <div
        className="w-[44px] h-[44px] flex items-center justify-center shrink-0"
        style={{
          backgroundImage:
            'linear-gradient(90deg,#E2FF3B 55%,transparent 55%),linear-gradient(90deg,#E2FF3B 55%,transparent 55%),linear-gradient(0deg,#E2FF3B 55%,transparent 55%),linear-gradient(0deg,#E2FF3B 55%,transparent 55%)',
          backgroundRepeat: 'repeat-x,repeat-x,repeat-y,repeat-y',
          backgroundSize: '10px 2px,10px 2px,2px 10px,2px 10px',
          backgroundPosition: '0 0,0 100%,0 0,100% 0',
        }}
      >
        <span style={{ color: '#E2FF3B', fontSize: '15px', fontWeight: 900, marginLeft: '2px' }}>▶</span>
      </div>

      {/* PIXEL 로고 텍스트 + 상태 */}
      <div className="flex items-end gap-5">
        <span style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: 'white', fontFamily: SCP }}>
          PIXEL
        </span>
        <div style={{ fontSize: '8px', lineHeight: 1.4, letterSpacing: '0.12em', paddingBottom: '3px' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)' }}>SYSTEM STATUS</div>
          <div style={{ color: 'white', fontWeight: 700 }}>OPERATIONAL_ENHANCEMENT</div>
        </div>
      </div>
    </header>
  );
}
