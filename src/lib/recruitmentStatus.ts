/**
 * Canonical recruitment status values from the workbook (`public/data/ministries_pvp.xlsx`, sheet `data`).
 * Used for chart/matrix column order; any other strings in the extract are appended alphabetically.
 */
export const RECRUITMENT_STATUS_ORDER: readonly string[] = [
  'Unknown Status',
  'Vacant',
  'Advertisement',
  'Recruitment Process',
  'Awaits Commission Decision',
  'Occupied (Acting)',
  'Occupied (Contract)',
  'Filled',
  'Filled (Internship)',
  'Filled (Temporary)',
];

const ORDER_SET = new Set(RECRUITMENT_STATUS_ORDER);

/** Normalise raw cell: blanks become Unknown Status (same as an explicit unknown in the sheet). */
export function normalizeRecruitmentStatus(raw: string): string {
  const t = raw.trim();
  return t || 'Unknown Status';
}

/** Backlog bucket for KPIs (replaces legacy “Not Started”). */
export function isPipelineBacklogStatus(status: string): boolean {
  return status === 'Vacant' || status === 'Unknown Status';
}

/** Statuses present in `rows`, ordered for charts and pivot tables. */
export function orderedRecruitmentStatuses(rows: Iterable<{ recruitmentStatus: string }>): string[] {
  const present = new Set<string>();
  for (const r of rows) present.add(r.recruitmentStatus);
  const ordered = RECRUITMENT_STATUS_ORDER.filter((s) => present.has(s));
  const rest = [...present].filter((s) => !ORDER_SET.has(s)).sort((a, b) => a.localeCompare(b));
  return [...ordered, ...rest];
}
