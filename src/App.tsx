import { useState } from 'react';
import { SCP } from './constants';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import AuthModal from './components/AuthModal';

/**
 * App — 루트 컴포넌트
 *
 * 현재: UI 표시용 더미 상태만 관리
 * 향후: AppState ('idle' | 'uploading' | 'processing' | 'result') 기반
 *       비디오 업로드, 프레임 추출 로직을 여기서 조율
 */
export default function App() {
  const [tag, setTag] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  // TODO: 백엔드 연동 시 추가할 상태들
  // const [appState, setAppState] = useState<AppState>('idle');
  // const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  // const [frameCount, setFrameCount] = useState(0);

  const handleExecute = () => {
    // TODO: 비디오 + 태그를 API로 전송하는 로직
    console.log('[PIXEL] EXECUTE_UPLOAD clicked, tag:', tag);
  };

  const handleReset = () => {
    // TODO: 파일 초기화 로직
    console.log('[PIXEL] RESET_IDENTIFICATION clicked');
  };

  const handleExtract = () => {
    // TODO: ZIP 다운로드 로직
    console.log('[PIXEL] EXTRACT_DATASET.ZIP clicked');
  };

  return (
    <div
      className="w-full min-h-screen md:h-screen bg-black text-white overflow-x-hidden md:overflow-hidden flex flex-col"
      style={{ fontFamily: SCP }}
    >
      <Header 
        onOpenLogin={() => setAuthMode('login')} 
        onOpenSignup={() => setAuthMode('signup')} 
      />

      <div className="flex flex-1 md:min-h-0 justify-center p-4 md:px-8 md:py-4 overflow-y-auto w-full">
        <div className="flex flex-col md:flex-row gap-5 md:gap-7 w-full md:max-w-[900px]">
          <div className="w-full md:w-[230px] shrink-0">
            <Sidebar
              tag={tag}
              onTagChange={setTag}
              onExecute={handleExecute}
              onReset={handleReset}
            />
          </div>
          <div className="w-full flex-1 md:max-w-[560px] min-w-0">
            <MainPanel
              onExtract={handleExtract}
            />
          </div>
        </div>
      </div>

      {/* 인증 모달 */}
      {authMode && (
        <AuthModal 
          initialMode={authMode} 
          onClose={() => setAuthMode(null)} 
        />
      )}
    </div>
  );
}