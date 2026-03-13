import { useState } from 'react';
import { SCP } from '../constants';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  initialMode?: AuthMode;
  onClose: () => void;
}

export default function AuthModal({ initialMode = 'login', onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* 바깥 클릭 영역 */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 모달 창 본체 */}
      <div 
        className="relative bg-black w-full max-w-md border border-[#E2FF3B] shadow-[0_0_30px_rgba(226,255,59,0.15)] flex flex-col"
        style={{ fontFamily: SCP }}
      >
        {/* 장식용 코너 요소 */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#E2FF3B] -translate-x-[1px] -translate-y-[1px]" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#E2FF3B] translate-x-[1px] -translate-y-[1px]" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#E2FF3B] -translate-x-[1px] translate-y-[1px]" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#E2FF3B] translate-x-[1px] translate-y-[1px]" />

        {/* 헤더 바 */}
        <div className="flex justify-between items-center border-b border-[#E2FF3B]/30 p-4 bg-[#E2FF3B]/5">
          <div className="flex items-center gap-2">
            <span className="text-[#E2FF3B] text-xs font-bold tracking-widest">
              {mode === 'login' ? '// SYSTEM_LOGIN' : '// NEW_OPERATOR_REG_'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-[#E2FF3B] transition-colors text-xs tracking-widest"
          >
            [ESC]
          </button>
        </div>

        {/* 내용 영역 */}
        <div className="p-8 pb-10 flex flex-col gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white mb-2 leading-none uppercase">
              {mode === 'login' ? 'Authentication\nRequired' : 'Operator\nRegistration'}
            </h2>
            <p className="text-xs text-white/50 tracking-wide uppercase">
              {mode === 'login' 
                ? 'Proceed to verify credentials.' 
                : 'Create secure system access.'}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[#E2FF3B] uppercase tracking-widest">Operator ID / Email</label>
              <input 
                type="text" 
                placeholder="Enter identifier..."
                className="w-full bg-[#111] border border-[#E2FF3B]/30 px-3 py-2 text-white outline-none focus:border-[#E2FF3B] focus:bg-black transition-colors text-sm"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[#E2FF3B] uppercase tracking-widest">Passcode</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-[#111] border border-[#E2FF3B]/30 px-3 py-2 text-white outline-none focus:border-[#E2FF3B] focus:bg-black transition-colors text-sm"
              />
            </div>

            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#E2FF3B] uppercase tracking-widest">Confirm Passcode</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-[#111] border border-[#E2FF3B]/30 px-3 py-2 text-white outline-none focus:border-[#E2FF3B] focus:bg-black transition-colors text-sm"
                />
              </div>
            )}
          </div>

          <button className="w-full bg-[#E2FF3B] text-black font-black uppercase tracking-widest py-3 mt-2 hover:bg-white transition-colors active:scale-[0.98]">
            {mode === 'login' ? 'Init Session' : 'Register Operator'}
          </button>

          {/* 전환 링크 */}
          <div className="mt-2 text-center text-xs text-white/50">
            {mode === 'login' ? (
              <>
                UNREGISTERED?{' '}
                <button 
                  onClick={() => setMode('signup')}
                  className="text-[#E2FF3B] hover:underline uppercase tracking-wide decoration-[#E2FF3B]/50 underline-offset-4"
                >
                  Create Identity
                </button>
              </>
            ) : (
              <>
                KNOWN OPERATOR?{' '}
                <button 
                  onClick={() => setMode('login')}
                  className="text-[#E2FF3B] hover:underline uppercase tracking-wide decoration-[#E2FF3B]/50 underline-offset-4"
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
