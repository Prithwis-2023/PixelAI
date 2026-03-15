export type AppState = 'idle' | 'uploading' | 'processing' | 'result';

export interface VideoFile {
  name: string;
  sizeMB: number;
}

export interface ExtractedFrame {
  id: number;
  url: string;
}
