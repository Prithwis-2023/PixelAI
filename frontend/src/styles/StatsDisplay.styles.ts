import { SCP } from '../constants';

export const S = {
  donutContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '8px' },
  donutSvg: { filter: (color: string) => `drop-shadow(0 0 6px ${color}88)` },
  donutValueText: { fontSize: "16", fontWeight: "900", fontFamily: SCP },
  donutMaxText: { fontSize: "9", fontFamily: SCP, fill: "rgba(255,255,255,0.4)" },
  donutLabelText: { fontFamily: SCP, fontSize: '8px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)' },

  lineChartContainer: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  lineChartTitle: { fontFamily: SCP, fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', margin: 0 },
  lineChartSvgStyle: { overflow: 'visible' as const },
  lineChartGuidelineText: { fontSize: "7", fontFamily: SCP, fill: "rgba(255,255,255,0.25)" },
  lineChartPolylineStyle: { filter: 'drop-shadow(0 0 4px rgba(45,235,169,0.88))' },
  lineChartDataText: { fontSize: "7", fontFamily: SCP, fill: "rgba(255,255,255,0.3)" },

  mainContainer: "flex flex-col flex-1 min-h-0 gap-5",
  mainTitle: { fontFamily: SCP, fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', margin: 0 },
  donutChartsRow: { display: 'flex', gap: '32px', alignItems: 'flex-start', justifyContent: 'center' },
  divider: { borderTop: '1px solid rgba(45,235,169,0.12)' },
  lineChartArea: { flex: 1, minHeight: 0 }
};
