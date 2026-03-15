
import { S } from '../styles/Header.styles';
import type { AuthenticatedUser } from '../types';

interface HeaderProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onLogout: () => void;
  currentUser: AuthenticatedUser | null;
  authBusy: boolean;
}

/** 픽셀 도트 테두리 로고 + PIXEL 텍스트 + SYSTEM STATUS + 인증 버튼 */
export default function Header({
  onOpenLogin,
  onOpenSignup,
  onLogout,
  currentUser,
  authBusy,
}: HeaderProps) {
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
        {currentUser ? (
          <>
            <div className={S.userPanel}>
              <span className={S.userLabel}>OPERATOR</span>
              <span className={S.userValue}>{currentUser.user_login_id}</span>
            </div>
            <button
              onClick={onLogout}
              className={S.logoutBtn}
              style={S.loginFont}
            >
              LOGOUT
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onOpenLogin}
              className={S.loginBtn}
              style={S.loginFont}
              disabled={authBusy}
            >
              LOGIN
            </button>
            <button
              onClick={onOpenSignup}
              className={S.signupBtn}
              style={S.signupFont}
              disabled={authBusy}
            >
              SIGN UP
            </button>
          </>
        )}
      </div>
    </header>
  );
}
