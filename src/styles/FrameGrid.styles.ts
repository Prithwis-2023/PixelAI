import { SCP } from '../constants';

export const S = {
  container: "flex flex-col flex-1 min-h-0",
  titleText: "shrink-0",
  titleStyle: { fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em', marginBottom: '6px', fontFamily: SCP },

  gridContainer: "flex-1 min-h-0 grid grid-cols-3",
  gridStyle: { gap: '10px', gridTemplateRows: 'repeat(3, 1fr)' },

  imageProps: "w-full h-full object-cover min-h-0 pixel-frame border border-[#2DEBA9]/50",
  dummyWrapper: "min-h-0 pixel-frame",
  
  dummyStyle: (opacity: number) => ({
    backgroundColor: `rgba(45,235,169,${opacity})`,
    boxShadow: `inset 0 0 0 1px rgba(45,235,169,${opacity + 0.2})`, // 8-bit inner border highlight
  }),
};
