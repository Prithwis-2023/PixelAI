import { SCP } from '../constants';

export const S = {
  container: "flex flex-col sm:flex-row justify-between items-start shrink-0 gap-4 sm:gap-0",
  
  leftBlock: "min-w-0 break-words",
  opsLabel: { fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', marginBottom: '4px', fontFamily: SCP },
  dataSaved: { fontSize: '22px', fontWeight: 900, letterSpacing: '0.06em', lineHeight: 1.2, color: 'white', fontFamily: SCP },
  
  rightBlock: "sm:text-right shrink-0 min-w-0 pl-0 sm:pl-5",
  rewardLabel: { fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', marginBottom: '4px', fontFamily: SCP },
  credits: { fontSize: '22px', fontWeight: 900, color: '#2DEBA9', lineHeight: 1.2, fontFamily: SCP },
};
