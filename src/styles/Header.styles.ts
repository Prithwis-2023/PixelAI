import { SCP } from '../constants';

export const S = {
  headerContainer: "shrink-0 flex items-center justify-between px-4 md:px-8 border-b border-[#2DEBA9]",
  headerStyle: { height: '80px' },

  logoGroup: "flex items-center gap-3 md:gap-5",
  logoWrapper: "w-[36px] h-[36px] md:w-[44px] md:h-[44px] flex items-center justify-center shrink-0",
  logoStyle: {
    backgroundImage: 'linear-gradient(90deg,#2DEBA9 55%,transparent 55%),linear-gradient(90deg,#2DEBA9 55%,transparent 55%),linear-gradient(0deg,#2DEBA9 55%,transparent 55%),linear-gradient(0deg,#2DEBA9 55%,transparent 55%)',
    backgroundRepeat: 'repeat-x,repeat-x,repeat-y,repeat-y',
    backgroundSize: '10px 2px,10px 2px,2px 10px,2px 10px',
    backgroundPosition: '0 0,0 100%,0 0,100% 0',
  },
  logoIcon: { color: '#2DEBA9', fontSize: '15px', fontWeight: 900, marginLeft: '2px' },

  titleGroup: "flex flex-col md:flex-row md:items-end gap-1 md:gap-3 md:gap-5 min-w-0",
  pixelTitle: "text-[22px] sm:text-[28px] md:text-[38px] font-black tracking-[-0.03em] leading-none text-white truncate",
  titleFont: { fontFamily: SCP },

  statusGroup: "hidden sm:block text-[8px] leading-[1.4] tracking-[0.12em] pb-[3px] min-w-0",
  statusLabel: "text-white/40 truncate",
  statusValue: "text-white font-bold truncate",

  actionGroup: "flex items-center gap-2 md:gap-3",
  loginBtn: "text-white hover:text-[#2DEBA9] text-[10px] md:text-xs font-bold tracking-widest px-3 md:px-4 py-2 transition-colors border border-transparent hover:border-[#2DEBA9]/30",
  loginFont: { fontFamily: SCP },
  signupBtn: "bg-[#2DEBA9]/10 border border-[#2DEBA9] text-[#2DEBA9] font-bold tracking-widest text-[10px] md:text-xs px-3 md:px-5 py-2 hover:bg-[#2DEBA9] hover:text-black transition-all",
  signupFont: { fontFamily: SCP },
};
