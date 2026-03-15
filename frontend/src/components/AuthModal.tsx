import { useEffect, useState, type FormEvent } from 'react';
import { SCP } from '../constants';
import { S } from '../styles/AuthModal.styles';
import type { AuthMode } from '../types';

interface AuthModalProps {
  initialMode?: AuthMode;
  onClose: () => void;
  onSubmit: (payload: {
    mode: AuthMode;
    userLoginId: string;
    password: string;
  }) => Promise<void>;
  onClearError: () => void;
  errorMessage: string | null;
  isSubmitting: boolean;
}

export default function AuthModal({
  initialMode = 'login',
  onClose,
  onSubmit,
  onClearError,
  errorMessage,
  isSubmitting,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [userLoginId, setUserLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setMode(initialMode);
    setLocalError(null);
    onClearError();
  }, [initialMode, onClearError]);

  useEffect(() => {
    setLocalError(null);
    setConfirmPassword('');
    onClearError();
  }, [mode, onClearError]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedUserLoginId = userLoginId.trim();
    if (!trimmedUserLoginId || !password) {
      setLocalError('Please enter both operator ID and passcode.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setLocalError('Passcodes do not match.');
      return;
    }

    setLocalError(null);
    await onSubmit({
      mode,
      userLoginId: trimmedUserLoginId,
      password,
    });
  }

  return (
    <div className={S.overlay}>
      {/* 바깥 클릭 영역 */}
      <div className={S.overlayClickArea} onClick={onClose} />

      {/* 모달 창 본체 */}
      <div className={S.modalContainer} style={{ fontFamily: SCP }}>
        {/* 장식용 코너 요소 */}
        <div className={S.cornerTopLeft} />
        <div className={S.cornerTopRight} />
        <div className={S.cornerBottomLeft} />
        <div className={S.cornerBottomRight} />

        {/* 헤더 바 */}
        <div className={S.headerBar}>
          <div className={S.headerTitleContainer}>
            <span className={S.headerTitle}>
              {mode === 'login' ? '//_SYSTEM_LOGIN' : '//_NEW_OPERATOR_REG_'}
            </span>
          </div>
          <button onClick={onClose} className={S.closeButton}>
            [ESC]
          </button>
        </div>

        {/* 내용 영역 */}
        <div className={S.contentArea}>
          <div className={S.titleContainer}>
            <h2 className={S.title}>
              {mode === 'login' ? 'Authentication Required' : 'Operator Registration'}
            </h2>
            <p className={S.subtitle}>
              {mode === 'login' 
                ? 'Proceed to verify credentials.' 
                : 'Create secure system access.'}
            </p>
          </div>

          <form className={S.formContainer} onSubmit={handleSubmit}>
            <div className={S.inputGroup}>
              <label className={S.label} htmlFor="auth-user-login-id">Operator ID / Email</label>
              <input
                id="auth-user-login-id"
                type="text"
                placeholder="Enter identifier..."
                className={S.input}
                value={userLoginId}
                onChange={(e) => {
                  setUserLoginId(e.target.value);
                  onClearError();
                }}
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>

            <div className={S.inputGroup}>
              <label className={S.label} htmlFor="auth-password">Passcode</label>
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                className={S.input}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  onClearError();
                }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                disabled={isSubmitting}
              />
            </div>

            {mode === 'signup' && (
              <div className={S.inputGroup}>
                <label className={S.label} htmlFor="auth-confirm-password">Confirm Passcode</label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className={S.input}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    onClearError();
                  }}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
            )}

            {(localError || errorMessage) && (
              <div className={S.errorMessage}>
                {localError ?? errorMessage}
              </div>
            )}

            <button className={S.submitButton} type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'login'
                  ? 'Authenticating...'
                  : 'Registering...'
                : mode === 'login'
                  ? 'Init Session'
                  : 'Register Operator'}
            </button>
          </form>

          {/* 전환 링크 */}
          <div className={S.toggleLinkContainer}>
            {mode === 'login' ? (
              <>
                <span>UNREGISTERED?</span>
                <button
                  onClick={() => setMode('signup')}
                  className={S.toggleLinkButton}
                  disabled={isSubmitting}
                  type="button"
                >
                  Create Identity
                </button>
              </>
            ) : (
              <>
                <span>KNOWN OPERATOR?</span>
                <button
                  onClick={() => setMode('login')}
                  className={S.toggleLinkButton}
                  disabled={isSubmitting}
                  type="button"
                >
                  Login Here
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
