import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Fragment, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { PageBreadcrumb } from '../components/Breadcrumb';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import {
  countActiveRecruitment,
  deptSummary,
  ministryAggregates,
  sum,
  type DeptSummary,
} from '../lib/data';
import { EXEC_CHART_TOP_N, truncateChartCategory } from '../lib/chartHelpers';
import { formatInt, formatVuv, formatVuvMillions } from '../lib/format';
import { useTheme } from '../theme/ThemeProvider';
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

function takeTopNByPosts<T extends { ministry: string; posts: number; salary: number }>(arr: T[], n: number): T[] {
  return [...arr].sort((a, b) => b.posts - a.posts).slice(0, n);
}

function takeTopNBySalary<T extends { ministry: string; posts: number; salary: number }>(arr: T[], n: number): T[] {
  return [...arr].sort((a, b) => b.salary - a.salary).slice(0, n);
}

function escTooltipText(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function ExecutiveOverview({ rows }: Props) {
  const { theme } = useTheme();
  const totalPosts = rows.length;
  const totalSalary = sum(rows, (r) => r.annualSalary);
  const activeRecruitment = countActiveRecruitment(rows);
  const notStartedCount = rows.filter((r) => r.recruitmentStatus === 'Not Started').length;
  const activeShare = totalPosts ? (activeRecruitment / totalPosts) * 100 : 0;

  const byMinPosts = ministryAggregates(rows);
  const chartPosts = useMemo(() => takeTopNByPosts(byMinPosts, EXEC_CHART_TOP_N), [byMinPosts]);
  const chartSalary = useMemo(() => takeTopNBySalary(byMinPosts, EXEC_CHART_TOP_N), [byMinPosts]);
  const summary = deptSummary(rows);

  const [chartTab, setChartTab] = useState<'posts' | 'salary'>('posts');
  const [openMinistries, setOpenMinistries] = useState<Set<string>>(() => new Set());

  const [execSort, setExecSort] = useState<{ key: ExecSortKey; dir: 'asc' | 'desc' }>({
    key: 'ministry',
    dir: 'asc',
  });

  const bumpSort = (key: ExecSortKey) =>
    setExecSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  const toggleMinistry = (m: string) =>
    setOpenMinistries((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });

  const postsChartOpts = useMemo(
    (): Highcharts.Options => ({
      chart: { type: 'bar', height: 380 },
      title: { text: 'Vacant posts by ministry' },
      subtitle:
        byMinPosts.length > EXEC_CHART_TOP_N
          ? {
              text: `Top ${EXEC_CHART_TOP_N} ministries by post count — see table for full list`,
              style: { fontSize: '11px' },
            }
          : undefined,
      xAxis: {
        categories: chartPosts.map((d) => d.ministry),
        title: { text: null },
        labels: {
          formatter: function () {
            return truncateChartCategory(String(this.value));
          },
          style: { textOverflow: 'ellipsis' },
        },
      },
      yAxis: {
        min: 0,
        title: { text: 'Post count' },
        allowDecimals: false,
      },
      legend: { enabled: false },
      plotOptions: {
        bar: {
          borderRadius: 0,
          borderWidth: 0,
          color: '#185FA5' as Highcharts.ColorString,
        },
      },
      series: [{ type: 'bar', name: 'Posts', data: chartPosts.map((d) => d.posts) }],
      tooltip: {
        shared: false,
        headerFormat: '',
        pointFormatter: function () {
          const idx = this.index ?? 0;
          const full = chartPosts[idx]?.ministry ?? String(this.category ?? '');
          const y = Number(this.y);
          return `<b>${escTooltipText(full)}</b><br/><b>${y}</b> posts`;
        },
      },
    }),
    [byMinPosts.length, chartPosts],
  );

  const salaryChartOpts = useMemo(
    (): Highcharts.Options => ({
      chart: { type: 'bar', height: 380 },
      title: { text: 'Annual salary exposure by ministry' },
      subtitle:
        byMinPosts.length > EXEC_CHART_TOP_N
          ? {
              text: `Top ${EXEC_CHART_TOP_N} ministries by payroll if filled — totals in KPI above`,
              style: { fontSize: '11px' },
            }
          : { text: 'If all listed posts were filled at current scales', style: { fontSize: '11px' } },
      xAxis: {
        categories: chartSalary.map((d) => d.ministry),
        title: { text: null },
        labels: {
          formatter: function () {
            return truncateChartCategory(String(this.value));
          },
        },
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
      plotOptions: {
        bar: {
          borderRadius: 0,
          borderWidth: 0,
          color: '#378ADD' as Highcharts.ColorString,
        },
      },
      series: [{ type: 'bar', name: 'Salary', data: chartSalary.map((d) => d.salary) }],
      tooltip: {
        shared: false,
        pointFormatter: function () {
          const idx = this.index ?? 0;
          const full = chartSalary[idx]?.ministry ?? String(this.category ?? '');
          const y = Number(this.y);
          return `<b>${escTooltipText(full)}</b><br/><b>${formatVuv(y)}</b> (${formatVuvMillions(y)})`;
        },
      },
    }),
    [byMinPosts.length, chartSalary],
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

  const expandAll = () => setOpenMinistries(new Set(grouped.map(([m]) => m)));
  const collapseAll = () => setOpenMinistries(new Set());

  const tableDeptRows = summary.length;
  const tableMinistries = grouped.length;

  const headerBtn =
    'w-full rounded-sm px-0 py-0 text-left font-semibold normal-case tracking-normal text-un-secondary underline-offset-2 hover:text-un-fg hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-primary';

  const tabBtn = (active: boolean) =>
    `rounded-sm px-3 py-2 text-[12px] font-semibold uppercase tracking-wide focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
      active
        ? 'bg-un-wash text-un-fg ring-1 ring-un-border'
        : 'bg-transparent text-un-tertiary hover:bg-un-canvas hover:text-un-secondary'
    }`;

  const insightStory = `${formatInt(totalPosts)} priority vacancy record${totalPosts === 1 ? '' : 's'} (${formatInt(
    notStartedCount,
  )} still marked “Not Started”). ${activeShare >= 10 ? `${activeShare.toFixed(1)}%` : formatInt(activeRecruitment)} ${
    activeShare >= 10 ? `have` : `post${activeRecruitment === 1 ? '' : 's'} have`
  } some recruitment movement — focus cost and ministry drill-down below.`;

  return (
    <div className="space-y-6">
      <PageBreadcrumb />
      <header className="un-page-header">
        <h1 className="text-[21px] font-semibold tracking-tight text-un-fg">Executive overview</h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-un-secondary">
          Leadership snapshot: volume, payroll exposure, and pipeline before you filter to a single ministry.
        </p>
      </header>

      <div
        className="rounded-md border border-un-border border-l-4 border-l-primary bg-un-wash px-4 py-3 text-[13px] leading-relaxed text-un-fg shadow-un-sm"
        role="region"
        aria-label="Executive insight"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-un-tertiary">At a glance</p>
        <p className="mt-1.5 font-medium text-un-fg">{insightStory}</p>
        <p className="mt-3 text-[12px] text-un-secondary">
          Next step:{' '}
          <NavLink
            to="/ministry"
            className="font-semibold text-primary no-underline hover:underline focus:outline-none focus-visible:underline"
          >
            Open ministry drill-down
          </NavLink>{' '}
          to compare departments and salary scales within one ministry.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          variant="primary"
          label="Total vacant posts"
          value={formatInt(totalPosts)}
          hint="All priority vacant records in the current extract"
        />
        <KpiCard
          label="Total annual cost (if filled)"
          value={formatVuv(totalSalary)}
          hint="Sum of annual salary for all listed vacancies"
        />
        <KpiCard
          variant="quiet"
          label="Posts with recruitment movement"
          value={formatInt(activeRecruitment)}
          hint='Statuses other than "Not Started"'
        />
      </div>

      <Panel title="Ministry comparison (choose a view)">
        <div className="mb-4 flex flex-wrap gap-1 border-b border-un-border pb-3" role="tablist" aria-label="Chart measure">
          <button
            type="button"
            role="tab"
            aria-selected={chartTab === 'posts'}
            className={tabBtn(chartTab === 'posts')}
            onClick={() => setChartTab('posts')}
          >
            Vacant posts
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={chartTab === 'salary'}
            className={tabBtn(chartTab === 'salary')}
            onClick={() => setChartTab('salary')}
          >
            Annual salary (VUV)
          </button>
        </div>
        <div role="tabpanel" className="min-h-[380px]">
          {chartTab === 'posts' ? (
            <HighchartsReact key={`${theme}-posts`} highcharts={Highcharts} options={postsChartOpts} />
          ) : (
            <HighchartsReact key={`${theme}-salary`} highcharts={Highcharts} options={salaryChartOpts} />
          )}
        </div>
      </Panel>

      <Panel title="Posts summary — ministry & department">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-un-border pb-3 text-[12px] text-un-secondary">
          <p className="font-medium text-un-fg">
            <span className="tabular-nums">{formatInt(tableMinistries)}</span> ministries ·{' '}
            <span className="tabular-nums">{formatInt(tableDeptRows)}</span> department rows ·{' '}
            <span className="tabular-nums">{formatInt(totalPosts)}</span> posts ·{' '}
            <span className="tabular-nums">{formatVuv(totalSalary)}</span> total salary
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded border border-un-border bg-un-surface px-2 py-1 text-[11px] font-semibold text-un-secondary hover:bg-un-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              onClick={expandAll}
            >
              Expand all
            </button>
            <button
              type="button"
              className="rounded border border-un-border bg-un-surface px-2 py-1 text-[11px] font-semibold text-un-secondary hover:bg-un-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              onClick={collapseAll}
            >
              Collapse all
            </button>
          </div>
        </div>
        <div className="max-h-[480px] un-table-shell">
          <table className="min-w-full border-collapse text-left text-[13px]">
            <caption className="border-b border-un-border px-3 py-2.5 text-left text-[11px] font-normal leading-snug text-un-secondary">
              Click column headings to sort ministries and aggregate columns. Expand a ministry row to reveal
              departments; use “Sort dept rows” beside the ministry name to reorder departments inside that ministry.
              Groups start collapsed.
            </caption>
            <thead className="sticky top-0 z-10 border-b border-un-border bg-un-canvas text-left text-[13px] font-semibold normal-case tracking-normal text-un-secondary">
              <tr>
                <th scope="col" className="px-3 py-2.5" aria-sort={ariaSort(execSort.key === 'ministry', execSort.dir)}>
                  <button type="button" className={headerBtn} onClick={() => bumpSort('ministry')}>
                    Ministry / department {execSort.key === 'ministry' ? (execSort.dir === 'asc' ? '▲' : '▼') : ''}
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
                    Annual salary (VUV) {execSort.key === 'salary' ? (execSort.dir === 'asc' ? '▲' : '▼') : ''}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(([ministry, depts], mi) => {
                const mPosts = depts.reduce((a, d) => a + d.posts, 0);
                const mSalary = depts.reduce((a, d) => a + d.salary, 0);
                const open = openMinistries.has(ministry);
                const deptRegionId = `exec-dept-${mi}`;
                return (
                  <Fragment key={ministry}>
                    <tr className="bg-un-canvas">
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <button
                            type="button"
                            aria-expanded={open}
                            aria-controls={deptRegionId}
                            onClick={() => toggleMinistry(ministry)}
                            className="inline-flex shrink-0 items-baseline gap-2 rounded-sm text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                          >
                            <span className="tabular-nums text-[11px] text-un-tertiary">{open ? '▼' : '▶'}</span>
                            <span className="text-[13px] font-semibold text-primary">{ministry}</span>
                          </button>
                          <span className="text-[11px] font-normal text-un-tertiary">
                            ({formatInt(depts.length)} dept{depts.length === 1 ? '' : 's'}) ·{' '}
                            <button
                              type="button"
                              className="font-semibold text-un-secondary underline-offset-2 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                              onClick={() => bumpSort('department')}
                            >
                              Sort dept rows
                            </button>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-[13px] font-semibold tabular-nums text-un-fg">
                        {formatInt(mPosts)}
                      </td>
                      <td className="px-3 py-2 text-right text-[13px] font-semibold tabular-nums text-un-fg">
                        {formatVuv(mSalary)}
                      </td>
                    </tr>
                    {open
                      ? depts.map((d, di) => (
                          <tr
                            key={`${ministry}__${d.department}`}
                            className="un-trow"
                            {...(di === 0 ? { id: deptRegionId } : {})}
                          >
                            <td className="px-3 py-2 pl-10 text-un-fg">{d.department || '—'}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{formatInt(d.posts)}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{formatVuv(d.salary)}</td>
                          </tr>
                        ))
                      : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
