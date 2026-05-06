import Papa from 'papaparse';
import type { VacancyRow } from './types';
import {
  isPipelineBacklogStatus,
  normalizeRecruitmentStatus,
  orderedRecruitmentStatuses,
} from './recruitmentStatus';

function parseSalary(v: string | undefined): number {
  if (v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

export async function loadVacancyRows(signal?: AbortSignal): Promise<VacancyRow[]> {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const url = `${base}data/ministries_pvp.csv`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const hint =
      res.status === 404
        ? ' Missing file: generate with npm run generate-data from ministries_pvp.xlsx, commit public/data/ministries_pvp.csv, then redeploy.'
        : '';
    throw new Error(`Failed to load data (${res.status}) ${url}.${hint}`);
  }
  const text = await res.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
  });
  if (parsed.errors.length) {
    console.warn('CSV parse warnings', parsed.errors);
  }
  return parsed.data
    .filter((r) => (r['MINISTRY'] ?? '').trim() !== '')
    .map((r) => ({
      ministry: (r['MINISTRY'] ?? '').trim(),
      department: (r['DEPARTMENT'] ?? '').trim(),
      priorityVacantPosts: (r['PRIORITY VACANT POSTS'] ?? '').trim(),
      postNumber: (r['POST NUMBER'] ?? '').trim(),
      salaryScale: (r['SALARY SCALE'] ?? '').trim(),
      annualSalary: parseSalary(r['ANNUAL SALARY']),
      recruitmentStatus: normalizeRecruitmentStatus((r['RECRUITMENT STATUS'] ?? '').trim()),
    }));
}

export function sum(rows: VacancyRow[], pick: (r: VacancyRow) => number): number {
  return rows.reduce((a, r) => a + pick(r), 0);
}

/** Rows not in the Vacant / Unknown backlog bucket (Advertisement through Filled*, etc.). */
export function countActiveRecruitment(rows: VacancyRow[]): number {
  return rows.filter((r) => !isPipelineBacklogStatus(r.recruitmentStatus)).length;
}

/** Vacant or Unknown Status — backlog KPIs on executive / recruitment views. */
export function countPipelineBacklog(rows: VacancyRow[]): number {
  return rows.filter((r) => isPipelineBacklogStatus(r.recruitmentStatus)).length;
}

export function ministryAggregates(rows: VacancyRow[]) {
  const map = new Map<string, { posts: number; salary: number }>();
  for (const r of rows) {
    const cur = map.get(r.ministry) ?? { posts: 0, salary: 0 };
    cur.posts += 1;
    cur.salary += r.annualSalary;
    map.set(r.ministry, cur);
  }
  return [...map.entries()]
    .map(([ministry, v]) => ({ ministry, posts: v.posts, salary: v.salary }))
    .sort((a, b) => b.posts - a.posts);
}

export type DeptSummary = {
  ministry: string;
  department: string;
  posts: number;
  salary: number;
};

export function deptSummary(rows: VacancyRow[]): DeptSummary[] {
  const map = new Map<string, DeptSummary>();
  for (const r of rows) {
    const key = `${r.ministry}\t${r.department}`;
    const cur =
      map.get(key) ??
      ({ ministry: r.ministry, department: r.department, posts: 0, salary: 0 } satisfies DeptSummary);
    cur.posts += 1;
    cur.salary += r.annualSalary;
    map.set(key, cur);
  }
  return [...map.values()].sort(
    (a, b) => a.ministry.localeCompare(b.ministry) || b.salary - a.salary || a.department.localeCompare(b.department),
  );
}

export function topSalaryScales(rows: VacancyRow[], limit: number) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = r.salaryScale || '(blank)';
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([scale, count]) => ({ scale, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function postsByDepartment(rows: VacancyRow[]) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = r.department || '(blank)';
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count);
}

export function statusCounts(rows: VacancyRow[]) {
  const keys = orderedRecruitmentStatuses(rows);
  const map = new Map<string, number>();
  for (const r of rows) {
    const s = r.recruitmentStatus;
    map.set(s, (map.get(s) ?? 0) + 1);
  }
  return keys.map((status) => ({ status, count: map.get(status) ?? 0 }));
}

export function ministryStatusMatrix(rows: VacancyRow[]) {
  const ministries = [...new Set(rows.map((r) => r.ministry))].sort();
  const statuses = orderedRecruitmentStatuses(rows);
  const cell = (m: string, s: string) => rows.filter((r) => r.ministry === m && r.recruitmentStatus === s).length;
  return { ministries, statuses, cell };
}

export function deptStatusMatrix(rows: VacancyRow[]) {
  const depts = [...new Set(rows.map((r) => r.department))].sort();
  const statuses = orderedRecruitmentStatuses(rows);
  const cell = (d: string, s: string) => rows.filter((r) => r.department === d && r.recruitmentStatus === s).length;
  return { depts, statuses, cell };
}
