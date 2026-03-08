import { useState } from 'react';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E2FF3B" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="7.5"/>
    <line x1="21" y1="21" x2="16.5" y2="16.5"/>
  </svg>
);

function App() {
  const [tag, setTag] = useState('');

  // 헤더: ~86px, body padding top+bottom: ~44px, search: ~48px, gap: ~12px, execute: ~48px, gap: ~12px
  // 남은 공간 = 740 - 86 - 44 - 48 - 12 - 48 - 12 = 490px → REC 박스 최대 높이
  const REC_MAX = 'calc(100vh - 86px - 44px - 48px - 12px - 48px - 24px)';

  return (
    <div className="w-screen h-screen bg-black text-white font-mono overflow-hidden flex flex-col">

      {/* ══ HEADER ~86px ══ */}
      <header className="shrink-0 flex items-center gap-5 px-8 py-4 border-b border-[#E2FF3B]">
        <div
          className="w-[46px] h-[46px] flex items-center justify-center shrink-0"
          style={{
            backgroundImage:
              'linear-gradient(90deg,#E2FF3B 55%,transparent 55%),linear-gradient(90deg,#E2FF3B 55%,transparent 55%),linear-gradient(0deg,#E2FF3B 55%,transparent 55%),linear-gradient(0deg,#E2FF3B 55%,transparent 55%)',
            backgroundRepeat: 'repeat-x,repeat-x,repeat-y,repeat-y',
            backgroundSize: '10px 2px,10px 2px,2px 10px,2px 10px',
            backgroundPosition: '0 0,0 100%,0 0,100% 0',
          }}
        >
          <span className="text-[#E2FF3B] text-[16px] font-black ml-0.5">▶</span>
        </div>
        <div className="flex items-baseline gap-4">
          <span className="text-white text-[36px] font-black tracking-tighter leading-none">PIXEL</span>
          <div className="text-[8px] leading-tight tracking-widest pb-0.5">
            <div className="text-white/40">SYSTEM STATUS</div>
            <div className="text-white font-bold">OPERATIONAL_ENHANCEMENT</div>
          </div>
        </div>
      </header>

      {/* ══ BODY ══ */}
      <div className="flex flex-1 min-h-0 px-8 pt-4 pb-3 gap-8">

        {/* ── LEFT 240px ── */}
        <aside className="shrink-0 flex flex-col gap-3" style={{ width: '240px' }}>

          {/* 검색창 */}
          <div className="relative shrink-0">
            <input
              type="text"
              value={tag}
              onChange={e => setTag(e.target.value)}
              className="w-full bg-black border border-white/50 px-4 py-2.5 pr-10 outline-none text-[#E2FF3B] text-[13px]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
          </div>

          {/* [REC] BOX — 최대 높이 제한으로 EXECUTE 버튼이 항상 보이게 */}
          <div
            className="border border-white/50 flex flex-col items-center justify-center gap-3"
            style={{ maxHeight: REC_MAX, flex: '1 1 0', minHeight: 0 }}
          >
            <span className="text-white text-[44px] font-black tracking-widest leading-none">[REC]</span>
            <div className="text-center mt-2 space-y-1.5">
              <p className="text-[10px] text-white font-bold tracking-widest">IDENTIFIED: INPUT_VIDEO.MP4</p>
              <p className="text-[9px] text-white/40 tracking-widest">SIZE: 1.33MB</p>
            </div>
            <button className="mt-3 border border-[#E2FF3B] text-[#E2FF3B] text-[9px] font-bold tracking-[0.06em] px-5 py-1.5 hover:bg-[#E2FF3B] hover:text-black transition-colors whitespace-nowrap">
              // RESET_IDENTIFICATION
            </button>
          </div>

          {/* EXECUTE_UPLOAD */}
          <div className="shrink-0 relative">
            <div className="absolute -top-[3px] left-[10px] w-[12px] h-[3px] bg-[#E2FF3B]" />
            <div className="absolute -bottom-[3px] right-[10px] w-[12px] h-[3px] bg-[#E2FF3B]" />
            <div className="absolute top-[20%] -left-[3px] w-[3px] h-[60%] bg-[#E2FF3B]" />
            <div className="absolute top-[20%] -right-[3px] w-[3px] h-[60%] bg-[#E2FF3B]" />
            <button className="w-full bg-[#E2FF3B] text-black font-black py-2.5 text-[11px] tracking-widest relative z-10">
              EXECUTE_UPLOAD
            </button>
          </div>
        </aside>

        {/* ── RIGHT ── */}
        <main className="flex flex-col flex-1 min-w-0 min-h-0 gap-3">

          {/* 상단 요약 */}
          <div className="flex justify-between items-start shrink-0">
            <div>
              <p className="text-[9px] text-white/50 tracking-[0.18em] mb-1">OPERATION SUMMARY</p>
              <h2 className="text-[26px] font-black tracking-wide leading-none whitespace-nowrap text-white">
                DATA_SAVED: 7 FRAMES
              </h2>
            </div>
            <div className="text-right shrink-0 pl-6">
              <p className="text-[9px] text-white/50 tracking-[0.18em] mb-1">REWARDS ISSUED</p>
              <p className="text-[26px] font-black text-[#E2FF3B] leading-none whitespace-nowrap">+70 CR</p>
            </div>
          </div>

          {/* 데이터셋 박스 */}
          <div className="shrink-0 border border-white/25 px-5 py-3.5 flex justify-between items-center">
            <div>
              <p className="text-[12px] font-bold text-white tracking-tight">AI _TRAINING_BUNDLE_GENERIC</p>
              <p className="text-[9px] text-white/40 mt-1 tracking-widest">FORMAT: YOLOV8// READY FOR OPTIMIZATION</p>
            </div>
            <div className="relative shrink-0 ml-4">
              <div className="absolute -top-[3px] left-[8px] w-[10px] h-[3px] bg-[#E2FF3B]" />
              <div className="absolute -bottom-[3px] right-[8px] w-[10px] h-[3px] bg-[#E2FF3B]" />
              <div className="absolute top-[15%] -right-[3px] w-[3px] h-[70%] bg-[#E2FF3B]" />
              <button className="bg-[#E2FF3B] text-black font-black px-5 py-2 text-[10px] tracking-widest relative z-10 whitespace-nowrap">
                EXTRACT_DATASET.ZIP
              </button>
            </div>
          </div>

          {/* 그리드 — 남은 공간 전부 사용, 3행 균등 */}
          <div className="flex flex-col flex-1 min-h-0">
            <p className="text-[9px] text-white/40 tracking-[0.18em] mb-1 shrink-0">// INSPECTED_DATA_STREAM</p>
            <div
              className="grid grid-cols-3 gap-2.5 flex-1 min-h-0"
              style={{ gridTemplateRows: 'repeat(3, 1fr)' }}
            >
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-[#E2FF3B] min-h-0" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;