/** Max ministries on executive bar charts — keeps readable labels; full breakdown remains in tables. */
export const EXEC_CHART_TOP_N = 14;

export function truncateChartCategory(name: string, maxChars = 40): string {
  const s = String(name).trim();
  if (s.length <= maxChars) return s;
  return `${s.slice(0, Math.max(1, maxChars - 1))}…`;
}
