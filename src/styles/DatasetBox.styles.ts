import { SCP } from '../constants';

export const S = {
  container: "shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center relative gap-4 sm:gap-0",
  containerStyle: { 
    padding: '16px 20px',
    backgroundColor: 'rgba(45,235,169,0.02)',
    boxShadow: 'inset 0 0 0 1px rgba(45,235,169,0.3)',
  },

  cornerTopLeft: "absolute top-0 left-0 w-1.5 h-1.5 bg-[#2DEBA9]",
  cornerTopRight: "absolute top-0 right-0 w-1.5 h-1.5 bg-[#2DEBA9]",
  cornerBottomLeft: "absolute bottom-0 left-0 w-1.5 h-1.5 bg-[#2DEBA9]",
  cornerBottomRight: "absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#2DEBA9]",

  titleBlock: "",
  titleStyle: { fontSize: '11px', fontWeight: 700, color: 'white', letterSpacing: '0.04em', fontFamily: SCP },
  subtitleStyle: { fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', letterSpacing: '0.1em', fontFamily: SCP },

  btnWrapper: "relative shrink-0 pixel-btn-primary",
  btnWrapperStyle: { marginLeft: '16px' },
  
  glitchTopLeft: { top: '-3px', left: '8px', width: '10px', height: '3px', background: '#2DEBA9' },
  glitchBottomRight: { bottom: '-3px', right: '8px', width: '10px', height: '3px', background: '#2DEBA9' },
  glitchRight: { top: '15%', right: '-3px', width: '3px', height: '70%', background: '#2DEBA9' },

  button: "relative z-10 w-full h-full flex items-center justify-center leading-none",
  buttonStyle: (disabled: boolean) => ({
    background: disabled ? 'rgba(45,235,169,0.4)' : '#2DEBA9',
    color: 'black',
    fontWeight: 900,
    fontSize: '9px',
    letterSpacing: '0.1em',
    padding: '8px 20px',
    fontFamily: SCP,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
  }),
};
