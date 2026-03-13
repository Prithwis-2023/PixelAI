import { SCP } from '../constants';

export const S = {
  appContainer: "w-full min-h-screen md:h-screen bg-black text-white overflow-x-hidden md:overflow-hidden flex flex-col",
  appFont: { fontFamily: SCP },

  mainLayout: "flex flex-1 md:min-h-0 justify-center p-4 md:px-8 md:py-4 overflow-y-auto w-full",
  mainWrapper: "flex flex-col md:flex-row gap-5 md:gap-7 w-full md:max-w-[900px]",
  
  sidebarWrapper: "w-full md:w-[230px] shrink-0",
  contentWrapper: "w-full flex-1 md:max-w-[560px] min-w-0",
};
