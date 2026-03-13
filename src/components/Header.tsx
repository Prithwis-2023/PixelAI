import { SCP } from '../constants';

interface HeaderProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

/** 픽셀 도트 테두리 로고 + PIXEL 텍스트 + SYSTEM STATUS + 인증 버튼 */
export default function Header({ onOpenLogin, onOpenSignup }: HeaderProps) {
  return (
    <header
      className="shrink-0 flex items-center justify-between px-4 md:px-8 border-b border-[#E2FF3B]"
      style={{ height: '80px' }}
    >
      <div className="flex items-center gap-3 md:gap-5">
        {/* 픽셀 도트 로고 */}
        <div
          className="w-[36px] h-[36px] md:w-[44px] md:h-[44px] flex items-center justify-center shrink-0"
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
        <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-3 md:gap-5 min-w-0">
          <span className="text-[22px] sm:text-[28px] md:text-[38px] font-black tracking-[-0.03em] leading-none text-white truncate" style={{ fontFamily: SCP }}>
            PIXEL
          </span>
          <div className="hidden sm:block text-[8px] leading-[1.4] tracking-[0.12em] pb-[3px] min-w-0">
            <div className="text-white/40 truncate">SYSTEM_STATUS</div>
            <div className="text-white font-bold truncate">OPERATIONAL_ENHANCEMENT</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button 
          onClick={onOpenLogin}
          className="text-white hover:text-[#E2FF3B] text-[10px] md:text-xs font-bold tracking-widest px-3 md:px-4 py-2 transition-colors border border-transparent hover:border-[#E2FF3B]/30"
          style={{ fontFamily: SCP }}
        >
          LOGIN
        </button>
        <button 
          onClick={onOpenSignup}
          className="bg-[#E2FF3B]/10 border border-[#E2FF3B] text-[#E2FF3B] font-bold tracking-widest text-[10px] md:text-xs px-3 md:px-5 py-2 hover:bg-[#E2FF3B] hover:text-black transition-all"
          style={{ fontFamily: SCP }}
        >
          SIGN UP
        </button>
      </div>
    </header>
  );
}
