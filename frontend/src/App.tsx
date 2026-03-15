import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import AuthModal from './components/AuthModal';
import PixelBackground from './components/PixelBackground';
import { S } from './styles/App.styles';

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
    <div className={S.appContainer} style={S.appFont}>
      <PixelBackground />
      <Header 
        onOpenLogin={() => setAuthMode('login')} 
        onOpenSignup={() => setAuthMode('signup')} 
      />

      <div className={S.mainLayout}>
        <div className={S.mainWrapper}>
          <div className={S.sidebarWrapper}>
            <Sidebar
              tag={tag}
              onTagChange={setTag}
              onExecute={handleExecute}
              onReset={handleReset}
            />
          </div>
          <div className={S.contentWrapper}>
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