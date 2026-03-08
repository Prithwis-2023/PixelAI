import { useState } from 'react';

const SCP = "'Source Code Pro', monospace";

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E2FF3B" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="7.5"/>
    <line x1="21" y1="21" x2="16.5" y2="16.5"/>
  </svg>
);

function App() {
  const [tag, setTag] = useState('');

  return (
    <div
      className="w-screen h-screen bg-black text-white overflow-hidden flex flex-col"
      style={{ fontFamily: SCP }}
    >
      {/* ══ HEADER ══ */}
      <header className="shrink-0 flex items-center gap-5 px-8 border-b border-[#E2FF3B]" style={{ height: '80px' }}>
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

        {/* PIXEL 로고 텍스트 */}
        <div className="flex items-end gap-5">
          <span style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: 'white', fontFamily: SCP }}>
            PIXEL
          </span>
          {/* 작은 상태 텍스트 */}
          <div style={{ fontSize: '8px', lineHeight: 1.4, letterSpacing: '0.12em', paddingBottom: '3px' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)' }}>SYSTEM STATUS</div>
            <div style={{ color: 'white', fontWeight: 700 }}>OPERATIONAL_ENHANCEMENT</div>
          </div>
        </div>
      </header>

      {/* ══ BODY ══ */}
      <div className="flex flex-1 min-h-0 gap-7" style={{ padding: '16px 32px 12px 32px' }}>

        {/* ── LEFT 230px ── */}
        <aside className="shrink-0 flex flex-col gap-3" style={{ width: '230px' }}>

          {/* 검색창 */}
          <div className="relative shrink-0">
            <input
              type="text"
              value={tag}
              onChange={e => setTag(e.target.value)}
              className="w-full bg-black outline-none"
              style={{
                border: '1px solid rgba(255,255,255,0.5)',
                padding: '10px 40px 10px 16px',
                color: '#E2FF3B',
                fontSize: '13px',
                fontFamily: SCP,
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
          </div>

          {/* [REC] BOX */}
          <div
            className="flex flex-col items-center justify-center gap-2"
            style={{
              border: '1px solid rgba(255,255,255,0.5)',
              flex: '1 1 0',
              minHeight: 0,
              maxHeight: 'calc(100vh - 80px - 28px - 50px - 12px - 48px - 12px)',
            }}
          >
            <span style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '0.06em', lineHeight: 1, color: 'white', fontFamily: SCP }}>
              [REC]
            </span>
            <div className="text-center" style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'white', fontFamily: SCP }}>
                IDENTIFIED: INPUT_VIDEO.MP4
              </p>
              <p style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontFamily: SCP }}>
                SIZE: 1.33MB
              </p>
            </div>
            {/* RESET 버튼 */}
            <button
              style={{
                marginTop: '14px',
                border: '1px solid #E2FF3B',
                color: '#E2FF3B',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '6px 18px',
                background: 'transparent',
                fontFamily: SCP,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              // RESET_IDENTIFICATION
            </button>
          </div>

          {/* EXECUTE_UPLOAD */}
          <div className="shrink-0 relative">
            {/* 글리치 장식 */}
            <div className="absolute bg-[#E2FF3B]" style={{ top: '-3px', left: '10px', width: '12px', height: '3px' }} />
            <div className="absolute bg-[#E2FF3B]" style={{ bottom: '-3px', right: '10px', width: '12px', height: '3px' }} />
            <div className="absolute bg-[#E2FF3B]" style={{ top: '20%', left: '-3px', width: '3px', height: '60%' }} />
            <div className="absolute bg-[#E2FF3B]" style={{ top: '20%', right: '-3px', width: '3px', height: '60%' }} />
            <button
              className="w-full relative z-10"
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

        {/* ── RIGHT ── */}
        <main className="flex flex-col flex-1 min-w-0 min-h-0 gap-3">

          {/* 상단 요약 */}
          <div className="flex justify-between items-start shrink-0">
            <div>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', marginBottom: '4px', fontFamily: SCP }}>
                OPERATION SUMMARY
              </p>
              <h2 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '0.06em', lineHeight: 1, color: 'white', fontFamily: SCP, whiteSpace: 'nowrap' }}>
                DATA_SAVED: 7 FRAMES
              </h2>
            </div>
            <div className="text-right shrink-0" style={{ paddingLeft: '20px' }}>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', marginBottom: '4px', fontFamily: SCP }}>
                REWARDS ISSUED
              </p>
              <p style={{ fontSize: '22px', fontWeight: 900, color: '#E2FF3B', lineHeight: 1, fontFamily: SCP, whiteSpace: 'nowrap' }}>
                +70 CR
              </p>
            </div>
          </div>

          {/* 데이터셋 박스 */}
          <div
            className="shrink-0 flex justify-between items-center"
            style={{ border: '1px solid rgba(255,255,255,0.25)', padding: '12px 20px' }}
          >
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'white', letterSpacing: '0.04em', fontFamily: SCP }}>
                AI _TRAINING_BUNDLE_GENERIC
              </p>
              <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', letterSpacing: '0.1em', fontFamily: SCP }}>
                FORMAT: YOLOV8// READY FOR OPTIMIZATION
              </p>
            </div>
            {/* EXTRACT 버튼 */}
            <div className="relative shrink-0" style={{ marginLeft: '16px' }}>
              <div className="absolute bg-[#E2FF3B]" style={{ top: '-3px', left: '8px', width: '10px', height: '3px' }} />
              <div className="absolute bg-[#E2FF3B]" style={{ bottom: '-3px', right: '8px', width: '10px', height: '3px' }} />
              <div className="absolute bg-[#E2FF3B]" style={{ top: '15%', right: '-3px', width: '3px', height: '70%' }} />
              <button
                className="relative z-10"
                style={{
                  background: '#E2FF3B',
                  color: 'black',
                  fontWeight: 900,
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  padding: '8px 20px',
                  fontFamily: SCP,
                  cursor: 'pointer',
                  border: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                EXTRACT_DATASET.ZIP
              </button>
            </div>
          </div>

          {/* 그리드 */}
          <div className="flex flex-col flex-1 min-h-0">
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em', marginBottom: '6px', fontFamily: SCP }} className="shrink-0">
              // INSPECTED_DATA_STREAM
            </p>
            <div
              className="flex-1 min-h-0 grid grid-cols-3"
              style={{ gap: '10px', gridTemplateRows: 'repeat(3, 1fr)' }}
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