import { SCP } from '../constants';

export const S = {
  mainContainer: "flex flex-col flex-1 min-h-0 w-full justify-center items-center py-8",
  mainTitle: { fontFamily: SCP, fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', marginBottom: '40px', textAlign: 'center' as const },
  
  pipelineWrapper: "flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 w-full max-w-4xl px-4",
  
  nodeContainer: "relative flex flex-col items-center justify-center p-6 border border-[#2DEBA9]/30 bg-black/40 backdrop-blur-sm w-full sm:w-1/3 min-h-[140px] transition-all duration-500 hover:border-[#2DEBA9] hover:shadow-[0_0_20px_rgba(45,235,169,0.3)]",
  nodeIconWrapper: "text-[#2DEBA9] mb-4",
  nodeTitle: { fontFamily: SCP, fontSize: '11px', fontWeight: 700, color: 'white', letterSpacing: '0.1em', marginBottom: '8px', textAlign: 'center' as const },
  nodeDesc: { fontFamily: SCP, fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textAlign: 'center' as const, lineHeight: '1.4' },
  
  // Decorative corners
  cornerTL: "absolute top-0 left-0 w-1.5 h-1.5 bg-[#2DEBA9]",
  cornerTR: "absolute top-0 right-0 w-1.5 h-1.5 bg-[#2DEBA9]",
  cornerBL: "absolute bottom-0 left-0 w-1.5 h-1.5 bg-[#2DEBA9]",
  cornerBR: "absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#2DEBA9]",
  
  // Connectors
  connectorH: "hidden sm:block w-8 h-[1px] bg-gradient-to-r from-[#2DEBA9]/20 via-[#2DEBA9] to-[#2DEBA9]/20",
  connectorV: "block sm:hidden w-[1px] h-8 bg-gradient-to-b from-[#2DEBA9]/20 via-[#2DEBA9] to-[#2DEBA9]/20",
  
  // Animated particles container
  particlesContainer: "mt-12 flex justify-center gap-2",
  particle: (delay: number) => ({
    width: '4px',
    height: '4px',
    backgroundColor: '#2DEBA9',
    animation: `pulse 1.5s infinite ${delay}s`,
  })
};
