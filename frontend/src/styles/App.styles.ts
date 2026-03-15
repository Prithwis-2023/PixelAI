import { SCP } from '../constants';

export const S = {
  appContainer: "w-full min-h-screen md:h-screen bg-black text-white overflow-x-hidden md:overflow-hidden flex flex-col",
  appFont: { fontFamily: SCP },

  mainLayout: "relative z-10 flex flex-1 md:min-h-0 justify-center p-4 md:px-12 md:py-8 overflow-y-auto w-full no-scrollbar",
  mainWrapper: "flex flex-col md:flex-row gap-6 md:gap-10 w-full max-w-[1920px]", // Almost full width of a 1080p screen
  
  sidebarWrapper: "w-full md:w-[35%] shrink-0", // 4 ratio
  contentWrapper: "w-full md:w-[65%] min-w-0 flex flex-col", // 6 ratio
};
