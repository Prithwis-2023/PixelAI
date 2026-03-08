import { useState } from 'react';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E2FF3B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

function App() {
  const [tag, setTag] = useState('');

  return (
    <div className="h-screen overflow-hidden bg-black text-[#E2FF3B] font-mono selection:bg-[#E2FF3B] selection:text-black flex flex-col">

      {/* ── 헤더 ── */}
      <header className="flex items-center gap-5 px-6 py-3 border-b border-[#E2FF3B]/25">
        {/* 로고 */}
        <div className="flex items-center gap-3">
          {/* 점선 박스 아이콘 */}
          <div className="border-2 border-dashed border-[#E2FF3B] p-2.5 flex items-center justify-center w-[52px] h-[52px]">
            <span className="text-[#E2FF3B] text-xl font-black leading-none">▶</span>
          </div>
          <span className="text-[36px] font-black tracking-tight text-white leading-none">PIXEL</span>
        </div>
        {/* 상태 텍스트 */}
        <div className="text-[9px] leading-snug tracking-widest opacity-80">
          <div className="text-[#E2FF3B]/60 uppercase">SYSTEM STATUS</div>
          <div className="text-[#E2FF3B] font-bold uppercase">OPERATIONAL_ENHANCEMENT</div>
        </div>
      </header>

      {/* ── 바디 ── */}
      <div className="flex flex-1 px-6 pt-6 gap-12">

        {/* 좌측 패널 — 너비 270px, 구분선 없음 */}
        <aside className="w-[270px] shrink-0 flex flex-col gap-4 pb-6">

          {/* 검색창 */}
          <div className="relative">
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full bg-black border border-[#E2FF3B] px-3 py-2.5 pr-10 outline-none text-[#E2FF3B] text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              <SearchIcon />
            </span>
          </div>

          {/* [REC] 박스 — 정사각형에 가까운 비율 */}
          <div className="border border-[#E2FF3B] flex flex-col items-center justify-center gap-2.5 py-8">
            <div className="text-[48px] font-black tracking-tighter text-white leading-none">[REC]</div>
            <div className="text-center mt-2 space-y-1">
              <p className="text-[11px] text-white font-bold uppercase tracking-wide">IDENTIFIED: INPUT_VIDEO.MP4</p>
              <p className="text-[9px] text-[#E2FF3B]/50 tracking-widest uppercase">SIZE: 1.33MB</p>
            </div>
            {/* RESET 버튼 — 노란 배경 + 검정 텍스트 */}
            <button className="mt-2 text-[9px] bg-[#E2FF3B] text-black font-bold px-4 py-1.5 uppercase tracking-[0.1em] hover:brightness-90 transition-all">
              // RESET_IDENTIFICATION
            </button>
          </div>

          {/* EXECUTE_UPLOAD — 노란 배경 + 검정 텍스트 */}
          <button className="self-start bg-[#E2FF3B] text-black font-black py-2 px-6 text-[11px] tracking-widest uppercase border border-[#E2FF3B] hover:brightness-90 transition-all active:scale-95">
            EXECUTE_UPLOAD
          </button>
        </aside>

        {/* 우측 패널 */}
        <main className="flex-1 flex flex-col gap-3 min-w-0 pb-4 overflow-hidden">

          {/* 요약 헤더 */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-[#E2FF3B]/60 uppercase tracking-widest mb-0.5">OPERATION SUMMARY</p>
              <h2 className="text-[28px] font-black tracking-tight leading-none whitespace-nowrap">
                <span className="text-white">DATA_SAVED: </span>
                <span className="text-[#E2FF3B]">7 FRAMES</span>
              </h2>
            </div>
            <div className="text-right shrink-0 pl-4">
              <p className="text-[9px] text-[#E2FF3B]/60 uppercase tracking-widest mb-0.5">REWARDS ISSUED</p>
              <p className="text-[28px] font-black text-[#E2FF3B] leading-none whitespace-nowrap">+70 CR</p>
            </div>
          </div>

          {/* 데이터셋 추출 박스 — 연한 border */}
          <div className="border border-[#E2FF3B]/35 px-5 py-3.5 flex justify-between items-center">
            <div>
              <h3 className="text-[13px] font-bold text-white uppercase tracking-tight">AI _TRAINING_BUNDLE_GENERIC</h3>
              <p className="text-[9px] text-[#E2FF3B]/50 mt-0.5 uppercase tracking-wide">FORMAT: YOLOV8// READY FOR OPTIMIZATION</p>
            </div>
            <button className="bg-[#E2FF3B] text-black px-4 py-1.5 font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity shadow-[4px_4px_0px_#ffffff] shrink-0 ml-4">
              EXTRACT_DATASET.ZIP
            </button>
          </div>

          {/* 프레임 그리드 — 렬에 flex-1로 나머지 공간 채움 */}
          <div className="flex-1 flex flex-col min-h-0">
            <p className="text-[9px] text-[#E2FF3B]/40 font-bold tracking-widest uppercase mb-2">// INSPECTED_DATA_STREAM</p>
            <div className="flex-1 grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#E2FF3B] hover:brightness-90 transition-all cursor-crosshair relative group"
                >
                  <span className="absolute bottom-1.5 left-2 text-[9px] text-black font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    FRAME_00{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;