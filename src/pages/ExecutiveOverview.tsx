import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Fragment, useMemo, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import {
  countActiveRecruitment,
  deptSummary,
  ministryAggregates,
  sum,
  type DeptSummary,
} from '../lib/data';
import { formatInt, formatVuv, formatVuvMillions } from '../lib/format';
import type { VacancyRow } from '../lib/types';

type Props = { rows: VacancyRow[] };

type ExecSortKey = 'ministry' | 'department' | 'posts' | 'salary';

function cmpStr(a: string, b: string, dir: 'asc' | 'desc') {
  const c = a.localeCompare(b);
  return dir === 'asc' ? c : -c;
}

function cmpNum(a: number, b: number, dir: 'asc' | 'desc') {
  return dir === 'asc' ? a - b : b - a;
}

function sortDeptsNatural(a: DeptSummary, b: DeptSummary) {
  return b.salary - a.salary || a.department.localeCompare(b.department);
}

function ariaSort(active: boolean, dir: 'asc' | 'desc'): 'none' | 'ascending' | 'descending' | 'other' {
  if (!active) return 'none';
  return dir === 'asc' ? 'ascending' : 'descending';
}

export function ExecutiveOverview({ rows }: Props) {
  const { theme } = useTheme();
  const totalPosts = rows.length;
  const totalSalary = sum(rows, (r) => r.annualSalary);
  const activeRecruitment = countActiveRecruitment(rows);
  const byMinPosts = ministryAggregates(rows);
  const byMinSalary = useMemo(() => [...byMinPosts].sort((a, b) => b.salary - a.salary), [byMinPosts]);
  const summary = deptSummary(rows);

  const [execSort, setExecSort] = useState<{ key: ExecSortKey; dir: 'asc' | 'desc' }>({
    key: 'ministry',
    dir: 'asc',
  });

  const bumpSort = (key: ExecSortKey) =>
    setExecSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  const postsChartOpts = useMemo(
    (): Highcharts.Options => ({
      chart: { type: 'bar', height: 420 },
      title: { text: 'Vacant posts by ministry' },
      xAxis: {
        categories: byMinPosts.map((d) => d.ministry),
        title: { text: null },
      },
      yAxis: {
        min: 0,
        title: { text: 'Post count' },
        allowDecimals: false,
      },
      legend: { enabled: false },
      plotOptions: { bar: { borderRadius: 0, borderWidth: 0, color: '#185FA5' as Highcharts.ColorString } },
      series: [{ type: 'bar', name: 'Posts', data: byMinPosts.map((d) => d.posts) }],
      tooltip: {
        shared: false,
        pointFormat: `<b>{point.y}</b> posts`,
      },
    }),
    [byMinPosts],
  );

  const salaryChartOpts = useMemo(
    (): Highcharts.Options => ({
      chart: { type: 'bar', height: 420 },
      title: { text: 'Annual salary cost by ministry' },
      subtitle: { text: 'If all listed posts were filled at current scales', style: { fontSize: '11px' } },
      xAxis: {
        categories: byMinSalary.map((d) => d.ministry),
        title: { text: null },
      },
      yAxis: {
        min: 0,
        title: { text: 'VUV (millions)' },
        labels: {
          formatter: function () {
            const v = Number(this.value);
            return `${(v / 1_000_000).toFixed(1)}M`;
          },
        },
      },
      legend: { enabled: false },
      plotOptions: { bar: { borderRadius: 0, borderWidth: 0, color: '#378ADD' as Highcharts.ColorString } },
      series: [{ type: 'bar', name: 'Salary', data: byMinSalary.map((d) => d.salary) }],
      tooltip: {
        shared: false,
        pointFormatter: function () {
          const y = Number(this.y);
          return `<b>${formatVuv(y)}</b> (${formatVuvMillions(y)})`;
        },
      },
    }),
    [byMinSalary],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, DeptSummary[]>();
    for (const r of summary) {
      const list = map.get(r.ministry) ?? [];
      list.push(r);
      map.set(r.ministry, list);
    }

    let entries = [...map.entries()];
    if (execSort.key === 'ministry') {
      entries.sort(([a], [b]) => cmpStr(a, b, execSort.dir));
    } else {
      entries.sort(([a], [b]) => a.localeCompare(b));
    }

    for (const [, depts] of entries) {
      if (execSort.key === 'ministry') {
        depts.sort(sortDeptsNatural);
      } else if (execSort.key === 'department') {
        depts.sort((a, b) => cmpStr(a.department, b.department, execSort.dir));
      } else if (execSort.key === 'posts') {
        depts.sort((a, b) => cmpNum(a.posts, b.posts, execSort.dir));
      } else {
        depts.sort((a, b) => cmpNum(a.salary, b.salary, execSort.dir));
      }
    }

    return entries;
  }, [summary, execSort]);

  const headerBtn =
    'w-full rounded-sm px-0 py-0 text-left font-semibold normal-case tracking-normal text-un-secondary underline-offset-2 hover:text-un-fg hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-primary';

  return (
    <div className="space-y-6">
      <header className="un-page-header">
        <h1 className="text-[21px] font-semibold tracking-tight text-un-fg">Executive overview</h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-un-secondary">
          Vacancy and annual cost summary for PSC leadership — priority vacant posts across ministries and
          departments.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Total vacant posts" value={formatInt(totalPosts)} />
        <KpiCard
          label="Total annual cost (if filled)"
          value={formatVuv(totalSalary)}
          hint="Sum of annual salary for all listed vacancies"
        />
        <KpiCard
          label="Posts with active recruitment"
          value={formatInt(activeRecruitment)}
          hint='Count where recruitment status is not "Not Started"'
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="">
          <HighchartsReact key={theme} highcharts={Highcharts} options={postsChartOpts} />
        </Panel>
        <Panel title="">
          <HighchartsReact key={theme} highcharts={Highcharts} options={salaryChartOpts} />
        </Panel>
      </div>

      <Panel title="Posts summary — ministry and department">
        <div className="max-h-[480px] un-table-shell">
          <table className="min-w-full border-collapse text-left text-[13px]">
            <caption className="border-b border-un-border px-3 py-2.5 text-left text-[11px] font-normal leading-snug text-un-secondary">
              Click a column heading to sort. Rows are grouped by ministry; zeros are explicit in cross-tab matrices
              elsewhere in this dashboard.
            </caption>
            <thead className="sticky top-0 z-10 border-b border-un-border bg-un-canvas text-left text-[13px] font-semibold normal-case tracking-normal text-un-secondary">
              <tr>
                <th scope="col" className="px-3 py-2.5" aria-sort={ariaSort(execSort.key === 'ministry', execSort.dir)}>
                  <button type="button" className={headerBtn} onClick={() => bumpSort('ministry')}>
                    Ministry {execSort.key === 'ministry' ? (execSort.dir === 'asc' ? '▲' : '▼') : ''}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-2.5"
                  aria-sort={ariaSort(execSort.key === 'department', execSort.dir)}
                >
                  <button type="button" className={headerBtn} onClick={() => bumpSort('department')}>
                    Department {execSort.key === 'department' ? (execSort.dir === 'asc' ? '▲' : '▼') : ''}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-2.5 text-right"
                  aria-sort={ariaSort(execSort.key === 'posts', execSort.dir)}
                >
                  <button type="button" className={`${headerBtn} w-full text-right`} onClick={() => bumpSort('posts')}>
                    Posts {execSort.key === 'posts' ? (execSort.dir === 'asc' ? '▲' : '▼') : ''}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-2.5 text-right"
                  aria-sort={ariaSort(execSort.key === 'salary', execSort.dir)}
                >
                  <button
                    type="button"
                    className={`${headerBtn} w-full text-right`}
                    onClick={() => bumpSort('salary')}
                  >
                    Annual salary (VUV){' '}
                    {execSort.key === 'salary' ? (execSort.dir === 'asc' ? '▲' : '▼') : ''}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(([ministry, depts]) => (
                <Fragment key={ministry}>
                  <tr className="bg-un-canvas">
                    <td colSpan={4} className="px-3 py-2 text-[12px] font-semibold text-primary">
                      {ministry}
                    </td>
                  </tr>
                  {depts.map((d) => (
                    <tr key={`${ministry}__${d.department}`} className="un-trow">
                      <td aria-hidden="true" className="min-w-[1rem] px-3 py-2" />
                      <td className="px-3 py-2 text-un-fg">{d.department || '—'}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatInt(d.posts)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatVuv(d.salary)}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
