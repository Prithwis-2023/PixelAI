export type AppState = 'idle' | 'uploading' | 'processing' | 'result';
export type AuthMode = 'login' | 'signup';

export interface VideoFile {
  name: string;
  sizeMB: number;
}

export interface ExtractedFrame {
  id: number;
  url: string;
}

export interface AuthenticatedUser {
  user_login_id: string;
  id: string;
  user_hash_id: string;
  github_url: string | null;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}
