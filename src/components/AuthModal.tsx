import { useState, useEffect } from 'react';
import { SCP } from '../constants';
import { S } from '../styles/AuthModal.styles';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  initialMode?: AuthMode;
  onClose: () => void;
}

export default function AuthModal({ initialMode = 'login', onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

          <div className={S.formContainer}>
            <div className={S.inputGroup}>
              <label className={S.label}>Operator ID / Email</label>
              <input type="text" placeholder="Enter identifier..." className={S.input} />
            </div>
            
            <div className={S.inputGroup}>
              <label className={S.label}>Passcode</label>
              <input type="password" placeholder="••••••••" className={S.input} />
            </div>

            {mode === 'signup' && (
              <div className={S.inputGroup}>
                <label className={S.label}>Confirm Passcode</label>
                <input type="password" placeholder="••••••••" className={S.input} />
              </div>
            )}
          </div>

          <button className={S.submitButton}>
            {mode === 'login' ? 'Init Session' : 'Register Operator'}
          </button>

          {/* 전환 링크 */}
          <div className={S.toggleLinkContainer}>
            {mode === 'login' ? (
              <>
                <span>UNREGISTERED?</span>
                <button onClick={() => setMode('signup')} className={S.toggleLinkButton}>
                  Create Identity
                </button>
              </>
            ) : (
              <>
                <span>KNOWN OPERATOR?</span>
                <button onClick={() => setMode('login')} className={S.toggleLinkButton}>
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
