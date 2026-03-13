import { SCP } from '../constants';

export const S = {
  container: "shrink-0 flex flex-col gap-3 w-full h-full",
  
  executeBtnWrapper: "shrink-0 relative pixel-btn-primary",
  glitchTopLeft: { top: '-3px', left: '10px', width: '12px', height: '3px', background: '#2DEBA9' },
  glitchBottomRight: { bottom: '-3px', right: '10px', width: '12px', height: '3px', background: '#2DEBA9' },
  glitchLeft: { top: '20%', left: '-3px', width: '3px', height: '60%', background: '#2DEBA9' },
  glitchRight: { top: '20%', right: '-3px', width: '3px', height: '60%', background: '#2DEBA9' },
  
  executeBtn: "w-full relative z-10 break-words leading-tight flex items-center justify-center min-h-[36px] py-1.5 px-2",
  executeBtnStyle: {
    background: '#2DEBA9',
    color: 'black',
    fontWeight: 900,
    fontSize: '10px',
    letterSpacing: '0.14em',
    fontFamily: SCP,
    cursor: 'pointer',
    border: 'none',
  },

  logContainer: "flex-1 mt-2 min-h-[200px] flex flex-col",
};
