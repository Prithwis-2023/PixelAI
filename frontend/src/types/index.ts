// 향후 상태 관리를 위한 타입 사전 정의
// 백엔드 연동 시 이 타입들을 기반으로 상태 로직을 구현합니다.

export type AppState = 'idle' | 'uploading' | 'processing' | 'result';

export interface VideoFile {
  name: string;
  sizeMB: number;
}

export interface ExtractedFrame {
  id: number;
  url: string;
}
