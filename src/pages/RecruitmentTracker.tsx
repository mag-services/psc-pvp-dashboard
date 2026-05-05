import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import { ministryStatusMatrix, statusCounts, sum } from '../lib/data';
import { formatInt, formatVuv } from '../lib/format';
import type { VacancyRow } from '../lib/types';

type Props = { rows: VacancyRow[] };

export function RecruitmentTracker({ rows }: Props) {
  const breakdown = useMemo(() => statusCounts(rows), [rows]);
  const notStartedRows = useMemo(() => rows.filter((r) => r.recruitmentStatus === 'Not Started'), [rows]);
  const pipelineCost = useMemo(() => sum(notStartedRows, (r) => r.annualSalary), [notStartedRows]);
  const activeRows = useMemo(
    () => rows.filter((r) => r.recruitmentStatus !== 'Not Started'),
    [rows],
  );
  const matrix = useMemo(() => ministryStatusMatrix(rows), [rows]);

  const notStartedShare = rows.length ? notStartedRows.length / rows.length : 0;

  const statusChart = useMemo(
    (): Highcharts.Options => ({
      chart: { type: 'bar', height: 320 },
      title: { text: 'Recruitment status pipeline' },
      subtitle: {
        text: `${(notStartedShare * 100).toFixed(1)}% of posts are still "Not Started". Use data labels on the chart to compare smaller categories.`,
        style: { fontSize: '11px', color: '#475569' },
      },
      xAxis: {
        categories: breakdown.map((d) => d.status),
        title: { text: null },
      },
      yAxis: {
        min: 0,
        title: { text: 'Post count' },
        allowDecimals: false,
      },
      legend: { enabled: false },
      plotOptions: {
        bar: {
          borderRadius: 2,
          dataLabels: { enabled: true, style: { fontSize: '10px', fontWeight: '400' } },
        },
      },
      series: [
        {
          type: 'bar',
          name: 'Posts',
          data: breakdown.map((d) => ({
            y: d.count,
            color: d.status === 'Not Started' ? ('#94a3b8' as Highcharts.ColorString) : ('#185FA5' as Highcharts.ColorString),
          })),
        },
      ],
      tooltip: { pointFormat: '<b>{point.y}</b> posts' },
    }),
    [breakdown, notStartedShare],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Recruitment tracker</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Pipeline status, cost still sitting in “Not Started”, and the small set of posts where recruitment has
          moved forward.
        </p>
      </header>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold text-amber-900">Dataset skew</p>
        <p className="mt-1 text-amber-900/90">
          Almost all vacancies default to <strong>Not Started</strong> ({formatInt(notStartedRows.length)} of{' '}
          {formatInt(rows.length)}). Smaller statuses are labelled directly on the status chart bars.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Posts — Not Started"
          value={formatInt(notStartedRows.length)}
          hint="Default / pipeline backlog"
        />
        <KpiCard
          label="Total cost — Not Started posts"
          value={formatVuv(pipelineCost)}
          hint="Annual salary still without active recruitment path"
        />
        <KpiCard
          label="Posts with movement"
          value={formatInt(activeRows.length)}
          hint='Statuses other than "Not Started"'
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="">
          <HighchartsReact highcharts={Highcharts} options={statusChart} />
        </Panel>
        <Panel title="Posts outside “Not Started”">
          <div className="max-h-[340px] overflow-auto rounded-lg border border-slate-100">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-2 py-2">Ministry</th>
                  <th className="px-2 py-2">Department</th>
                  <th className="px-2 py-2">Post</th>
                  <th className="px-2 py-2 text-right">Annual salary</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeRows.map((r, i) => (
                  <tr key={`${r.ministry}-${r.postNumber}-${i}`} className="border-t border-slate-100">
                    <td className="px-2 py-2 text-slate-800">{r.ministry}</td>
                    <td className="px-2 py-2">{r.department || '—'}</td>
                    <td className="px-2 py-2">{r.priorityVacantPosts}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{formatVuv(r.annualSalary)}</td>
                    <td className="px-2 py-2 font-medium text-primary">{r.recruitmentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activeRows.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No rows with non-default status.</p>
          ) : null}
        </Panel>
      </div>

      <Panel title="Ministry × recruitment status (post counts)">
        <div className="max-h-[480px] overflow-auto rounded-lg border border-slate-100">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-2 py-2">Ministry</th>
                {matrix.statuses.map((s) => (
                  <th key={s} className="px-2 py-2 text-right">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.ministries.map((m) => (
                <tr key={m} className="border-t border-slate-100">
                  <td className="px-2 py-2 font-medium text-slate-800">{m}</td>
                  {matrix.statuses.map((s) => (
                    <td key={s} className="px-2 py-2 text-right tabular-nums text-slate-700">
                      {matrix.cell(m, s) || ''}
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
