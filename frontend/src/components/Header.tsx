

import { S } from '../styles/Header.styles';

interface HeaderProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

/** 픽셀 도트 테두리 로고 + PIXEL 텍스트 + SYSTEM STATUS + 인증 버튼 */
export default function Header({ onOpenLogin, onOpenSignup }: HeaderProps) {
  return (
    <header className={S.headerContainer} style={S.headerStyle}>
      <div className={S.logoGroup}>
        {/* 픽셀 도트 로고 */}
        <div className={S.logoWrapper} style={S.logoStyle}>
          <span style={S.logoIcon}>▶</span>
        </div>

        {/* PIXEL 로고 텍스트 + 상태 */}
        <div className={S.titleGroup}>
          <span className={S.pixelTitle} style={S.titleFont}>
            PIXEL
          </span>
          <div className={S.statusGroup}>
            <div className={S.statusLabel}>SYSTEM_STATUS</div>
            <div className={S.statusValue}>OPERATIONAL_ENHANCEMENT</div>
          </div>
        </div>
      </div>

      <div className={S.actionGroup}>
        <button 
          onClick={onOpenLogin}
          className={S.loginBtn}
          style={S.loginFont}
        >
          LOGIN
        </button>
        <button 
          onClick={onOpenSignup}
          className={S.signupBtn}
          style={S.signupFont}
        >
          SIGN UP
        </button>
      </div>
    </header>
  );
}
