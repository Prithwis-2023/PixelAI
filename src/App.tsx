import { useState } from 'react';
import { SCP } from './constants';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';

/**
 * App — 루트 컴포넌트
 *
 * 현재: UI 표시용 더미 상태만 관리
 * 향후: AppState ('idle' | 'uploading' | 'processing' | 'result') 기반
 *       비디오 업로드, 프레임 추출 로직을 여기서 조율
 */
export default function App() {
  const [tag, setTag] = useState('');

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
      className="w-screen h-screen bg-black text-white overflow-hidden flex flex-col"
      style={{ fontFamily: SCP }}
    >
      <Header />

      <div className="flex flex-1 min-h-0 gap-7" style={{ padding: '16px 32px 12px 32px' }}>
        <Sidebar
          tag={tag}
          onTagChange={setTag}
          onExecute={handleExecute}
          onReset={handleReset}
        />
        <MainPanel
          onExtract={handleExtract}
        />
      </div>
    </div>
  );
}