import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { CHART_FONT, chartMutedLabelColor, chartSecondaryBarColor } from '../lib/chartTheme';
import { PageBreadcrumb } from '../components/Breadcrumb';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import { ministryStatusMatrix, statusCounts, sum } from '../lib/data';
import { isPipelineBacklogStatus } from '../lib/recruitmentStatus';
import { formatInt, formatVuv } from '../lib/format';
import type { VacancyRow } from '../lib/types';

type Props = { rows: VacancyRow[] };

export function RecruitmentTracker({ rows }: Props) {
  const { theme } = useTheme();
  const breakdown = useMemo(() => statusCounts(rows), [rows]);
  const backlogRows = useMemo(
    () => rows.filter((r) => isPipelineBacklogStatus(r.recruitmentStatus)),
    [rows],
  );
  const pipelineCost = useMemo(() => sum(backlogRows, (r) => r.annualSalary), [backlogRows]);
  const progressedRows = useMemo(
    () => rows.filter((r) => !isPipelineBacklogStatus(r.recruitmentStatus)),
    [rows],
  );
  const matrix = useMemo(() => ministryStatusMatrix(rows), [rows]);

  const backlogShare = rows.length ? backlogRows.length / rows.length : 0;

  const statusChart = useMemo((): Highcharts.Options => {
    const muted = chartMutedLabelColor(theme);
    const secondaryBar = chartSecondaryBarColor(theme);
    return {
      chart: { type: 'bar', height: 320 },
      title: { text: '' },
      subtitle: {
        text: `${(backlogShare * 100).toFixed(1)}% of posts are Vacant or unknown status. Highlighted bars use the secondary colour; other stages use the primary colour.`,
        style: { fontSize: '11px', color: muted },
      },
      xAxis: {
        categories: breakdown.map((d) => d.status),
        title: { text: '' },
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
          dataLabels: {
            enabled: true,
            style: {
              fontSize: '10px',
              fontWeight: '500',
              color: muted,
              fontFamily: CHART_FONT,
            },
          },
        },
      },
      series: [
        {
          type: 'bar',
          name: 'Posts',
          data: breakdown.map((d) => ({
            y: d.count,
            color: isPipelineBacklogStatus(d.status)
              ? (secondaryBar as Highcharts.ColorString)
              : ('#185FA5' as Highcharts.ColorString),
          })),
        },
      ],
      tooltip: { pointFormat: '<b>{point.y}</b> posts' },
    };
  }, [breakdown, backlogShare, theme]);

  return (
    <div className="space-y-6">
      <PageBreadcrumb />
      <header className="un-page-header">
        <h1 className="text-[21px] font-semibold tracking-tight text-un-fg">Recruitment tracker</h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-un-secondary">
          Pipeline by recruitment status (workbook values), cost sitting in the Vacant / unknown backlog, and posts that
          already show progress or an outcome.
        </p>
      </header>

      <div className="rounded-md border border-un-border border-l-4 border-l-accent bg-un-wash p-4 shadow-un-sm dark:bg-un-wash/70">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-un-fg">Methodological note</p>
        <p className="mt-2 text-[12px] font-normal leading-relaxed text-un-secondary">
          The extract uses these recruitment statuses (see user guide): Vacant, Unknown Status, Advertisement, Recruitment
          Process, Awaits Commission Decision, Occupied (Acting), Occupied (Contract), Filled, Filled (Internship), Filled
          (Temporary). For headline KPIs we treat <strong className="font-semibold text-un-fg">Vacant</strong> and{' '}
          <strong className="font-semibold text-un-fg">Unknown Status</strong> as the backlog bucket (
          {formatInt(backlogRows.length)} of {formatInt(rows.length)} records). On-bar counts summarise each segment
          against that dominant bucket.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Posts — Vacant or unknown"
          value={formatInt(backlogRows.length)}
          hint="Backlog bucket (no progress recorded or status missing)"
        />
        <KpiCard
          label="Total cost — Vacant / unknown posts"
          value={formatVuv(pipelineCost)}
          hint="Annual salary for rows still in the backlog bucket"
        />
        <KpiCard
          label="Posts with progress or outcome"
          value={formatInt(progressedRows.length)}
          hint="All statuses except Vacant / unknown"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Posts beyond Vacant / unknown">
          <p className="mb-3 text-[12px] leading-relaxed text-un-secondary">
            Recruitment progress or outcome — same posts as non-backlog segments in the chart (right on large screens).
          </p>
          <div className="max-h-[340px] un-table-shell">
            <table className="min-w-full text-left text-[13px]">
              <thead className="un-thead">
                <tr>
                  <th className="px-2 py-2 font-semibold normal-case tracking-normal text-un-secondary">Ministry</th>
                  <th className="px-2 py-2 font-semibold normal-case tracking-normal text-un-secondary">Department</th>
                  <th className="px-2 py-2 font-semibold normal-case tracking-normal text-un-secondary">Post</th>
                  <th className="px-2 py-2 text-right font-semibold normal-case tracking-normal text-un-secondary">
                    Annual salary
                  </th>
                  <th className="px-2 py-2 font-semibold normal-case tracking-normal text-un-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {progressedRows.map((r) => (
                  <tr
                    key={`${r.ministry}|${r.department}|${r.postNumber}|${r.priorityVacantPosts}|${r.recruitmentStatus}`}
                    className="un-trow"
                  >
                    <td className="px-2 py-2 font-medium text-un-fg">{r.ministry}</td>
                    <td className="px-2 py-2 text-un-secondary">{r.department || '—'}</td>
                    <td className="px-2 py-2 text-un-secondary">{r.priorityVacantPosts}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-un-fg">{formatVuv(r.annualSalary)}</td>
                    <td className="px-2 py-2 font-semibold text-primary">{r.recruitmentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {progressedRows.length === 0 ? (
            <p className="mt-3 text-[13px] text-un-secondary">Every row is still Vacant or unknown status.</p>
          ) : null}
        </Panel>
        <Panel title="Recruitment status pipeline">
          <HighchartsReact key={theme} highcharts={Highcharts} options={statusChart} />
        </Panel>
      </div>

      <Panel title="Ministry × recruitment status (post counts)">
        <div className="max-h-[480px] un-table-shell">
          <table className="min-w-full border-collapse text-left text-[13px]">
            <caption className="border-b border-un-border px-2 py-2 text-left text-[11px] font-normal leading-snug text-un-secondary">
              Cell values are counts of vacant posts. Zero means no posts with that recruitment status for the ministry.
            </caption>
            <thead className="un-thead">
              <tr>
                <th className="px-2 py-2 font-semibold normal-case tracking-normal text-un-secondary">Ministry</th>
                {matrix.statuses.map((s) => (
                  <th key={s} className="px-2 py-2 text-right font-semibold normal-case tracking-normal text-un-secondary">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.ministries.map((m) => (
                <tr key={m} className="un-trow">
                  <td className="px-2 py-2 font-semibold text-un-fg">{m}</td>
                  {matrix.statuses.map((s) => (
                    <td key={s} className="px-2 py-2 text-right tabular-nums text-un-secondary">
                      {matrix.cell(m, s)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
