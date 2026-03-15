export const S = {
  overlay: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4",
  overlayClickArea: "absolute inset-0",
  modalContainer: "relative bg-black w-full max-w-[400px] border border-[#2DEBA9] shadow-[0_0_30px_rgba(45,235,169,0.15)] flex flex-col mx-auto",
  
  cornerTopLeft: "absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#2DEBA9] -translate-x-[1px] -translate-y-[1px]",
  cornerTopRight: "absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#2DEBA9] translate-x-[1px] -translate-y-[1px]",
  cornerBottomLeft: "absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#2DEBA9] -translate-x-[1px] translate-y-[1px]",
  cornerBottomRight: "absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#2DEBA9] translate-x-[1px] translate-y-[1px]",

  headerBar: "flex justify-between items-center border-b border-[#2DEBA9]/30 p-4 bg-[#2DEBA9]/5 min-w-0",
  headerTitleContainer: "flex items-center gap-2 min-w-0",
  headerTitle: "text-[#2DEBA9] text-[10px] md:text-xs font-bold tracking-widest break-all md:break-words line-clamp-2",
  closeButton: "text-white/50 hover:text-[#2DEBA9] transition-colors text-xs tracking-widest p-1 shrink-0 ml-2",

  contentArea: "p-6 md:p-8 pb-8 md:pb-10 flex flex-col gap-6 min-w-0",
  titleContainer: "break-words",
  title: "text-xl sm:text-2xl md:text-3xl font-black tracking-tighter text-white mb-2 leading-none uppercase",
  subtitle: "text-[10px] md:text-xs text-white/50 tracking-wide uppercase",

  formContainer: "flex flex-col gap-4",
  inputGroup: "flex flex-col gap-1.5 min-w-0",
  label: "text-[10px] text-[#2DEBA9] uppercase tracking-widest break-words",
  input: "w-full bg-[#111] border border-[#2DEBA9]/30 px-3 py-3 text-white outline-none focus:border-[#2DEBA9] focus:bg-black transition-colors text-sm",
  errorMessage: "border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-3 py-2 text-[11px] text-[#ff9a9a] leading-relaxed",

  submitButton: "w-full bg-[#2DEBA9] text-black font-black uppercase tracking-widest py-3 md:py-4 mt-2 hover:bg-white transition-colors active:scale-[0.98] leading-tight break-words disabled:opacity-60 disabled:hover:bg-[#2DEBA9] disabled:cursor-not-allowed",

  toggleLinkContainer: "mt-2 text-center text-[10px] md:text-xs text-white/50 break-words flex flex-wrap justify-center gap-1",
  toggleLinkButton: "text-[#2DEBA9] hover:underline uppercase tracking-wide decoration-[#2DEBA9]/50 underline-offset-4",
};
