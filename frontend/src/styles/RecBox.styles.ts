import { SCP } from '../constants';

export const S = {
  containerWrapper: "flex flex-col items-center justify-center gap-2 p-4 min-w-0",
  containerStyle: {
    border: '1px solid rgba(255,255,255,0.5)',
    flex: '1 1 auto',
    minHeight: '150px',
  },
  
  recText: "text-[32px] md:text-[40px] font-black tracking-[0.06em] leading-none text-white break-words text-center",
  recTextStyle: { fontFamily: SCP },

  infoBlock: "text-center mt-3 min-w-0 w-full px-2",
  fileName: "text-[10px] font-bold tracking-[0.12em] text-white break-all line-clamp-2",
  fileNameStyle: { fontFamily: SCP },
  fileSize: "text-[9px] tracking-[0.12em] text-white/40 mt-1 break-words",
  fileSizeStyle: { fontFamily: SCP },

  resetBtn: "pixel-btn-outline mt-3 border border-[#2DEBA9] text-[#2DEBA9] text-[9px] font-bold tracking-[0.08em] px-4 py-2 hover:bg-[#2DEBA9] hover:text-black transition-colors break-words text-center max-w-full leading-tight",
  resetBtnStyle: { fontFamily: SCP },
};
