import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import { deptStatusMatrix, postsByDepartment, topSalaryScales } from '../lib/data';
import { formatInt, formatVuv } from '../lib/format';
import type { VacancyRow } from '../lib/types';

type Props = { rows: VacancyRow[] };

const colHelper = createColumnHelper<VacancyRow>();

export function MinistryDrillDown({ rows }: Props) {
  const { theme } = useTheme();
  const ministries = useMemo(
    () => [...new Set(rows.map((r) => r.ministry))].sort(),
    [rows],
  );
  const [ministry, setMinistry] = useState('');

  useEffect(() => {
    if (ministry && !ministries.includes(ministry)) {
      setMinistry('');
    }
  }, [ministries, ministry]);

  const selectedMinistry = ministry || ministries[0] || '';

  const filtered = useMemo(
    () => rows.filter((r) => r.ministry === selectedMinistry),
    [rows, selectedMinistry],
  );

  const deptCounts = useMemo(() => postsByDepartment(filtered), [filtered]);
  const scaleTop = useMemo(() => topSalaryScales(filtered, 15), [filtered]);

  const top20 = useMemo(
    () => [...filtered].sort((a, b) => b.annualSalary - a.annualSalary).slice(0, 20),
    [filtered],
  );

  const matrix = useMemo(() => deptStatusMatrix(filtered), [filtered]);

  const deptChart = useMemo(
    (): Highcharts.Options => ({
      chart: { type: 'column', height: 360 },
      title: { text: 'Vacant posts by department' },
      xAxis: { categories: deptCounts.map((d) => d.department), labels: { rotation: -35 } },
      yAxis: { min: 0, title: { text: 'Post count' }, allowDecimals: false },
      legend: { enabled: false },
      plotOptions: { column: { borderRadius: 0, borderWidth: 0, color: '#185FA5' as Highcharts.ColorString } },
      series: [{ type: 'column', name: 'Posts', data: deptCounts.map((d) => d.count) }],
      tooltip: { pointFormat: '<b>{point.y}</b> posts' },
    }),
    [deptCounts],
  );

  const scaleChart = useMemo(
    (): Highcharts.Options => ({
      chart: { type: 'column', height: 380 },
      title: { text: 'Posts by salary scale (top 15)' },
      xAxis: { categories: scaleTop.map((s) => s.scale), labels: { rotation: -35 } },
      yAxis: { min: 0, title: { text: 'Post count' }, allowDecimals: false },
      legend: { enabled: false },
      plotOptions: { column: { borderRadius: 0, borderWidth: 0, color: '#378ADD' as Highcharts.ColorString } },
      series: [{ type: 'column', name: 'Posts', data: scaleTop.map((s) => s.count) }],
      tooltip: { pointFormat: '<b>{point.y}</b> posts' },
    }),
    [scaleTop],
  );

  const table = useReactTable({
    data: top20,
    columns: useMemo(
      () => [
        colHelper.accessor('priorityVacantPosts', { header: 'Priority vacant post' }),
        colHelper.accessor('salaryScale', { header: 'Salary scale' }),
        colHelper.accessor('annualSalary', {
          header: 'Annual salary',
          cell: (ctx) => formatVuv(ctx.getValue()),
        }),
      ],
      [],
    ),
    getCoreRowModel: getCoreRowModel(),
  });

  if (!ministries.length) {
    return <p className="text-[13px] text-un-secondary">No rows loaded.</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="un-page-header min-w-0 flex-1">
          <h1 className="text-[21px] font-semibold tracking-tight text-un-fg">Ministry drill-down</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-un-secondary">
            Focus on departments, salary scales, and highest-cost posts within a ministry.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-un-tertiary">
          Ministry filter
          <select
            className="min-w-[220px] rounded border border-un-border bg-un-surface px-3 py-2 text-[13px] font-normal text-un-fg shadow-un-sm outline-none focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={selectedMinistry}
            onChange={(e) => setMinistry(e.target.value)}
          >
            {ministries.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Posts in selection" value={formatInt(filtered.length)} />
        <KpiCard
          label="Annual salary in selection"
          value={formatVuv(filtered.reduce((a, r) => a + r.annualSalary, 0))}
        />
        <KpiCard
          label="Departments"
          value={formatInt(deptCounts.length)}
          hint={`${selectedMinistry}: department coverage`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="">
          <HighchartsReact key={theme} highcharts={Highcharts} options={deptChart} />
        </Panel>
        <Panel title="">
          <HighchartsReact key={theme} highcharts={Highcharts} options={scaleChart} />
        </Panel>
      </div>

      <Panel title="Top 20 posts by annual salary">
        <div className="un-table-shell">
          <table className="min-w-full text-left text-[13px]">
            <thead className="un-thead">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className={`px-3 py-2 font-semibold normal-case tracking-normal text-un-secondary ${
                        h.column.id === 'annualSalary' ? 'text-right' : ''
                      }`}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="un-trow">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-3 py-2 text-un-fg ${cell.column.id === 'annualSalary' ? 'text-right tabular-nums' : ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Recruitment status by department">
        <div className="max-h-[420px] un-table-shell">
          <table className="min-w-full border-collapse text-left text-[13px]">
            <caption className="border-b border-un-border px-2 py-2 text-left text-[11px] font-normal leading-snug text-un-secondary">
              Cell values are counts of vacant posts. Zero means no posts in that recruitment status for the
              department.
            </caption>
            <thead className="un-thead">
              <tr>
                <th className="px-2 py-2.5 font-semibold normal-case tracking-normal text-un-secondary">Department</th>
                {matrix.statuses.map((s) => (
                  <th key={s} className="px-2 py-2.5 text-right font-semibold normal-case tracking-normal text-un-secondary">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.depts.map((d) => (
                <tr key={d} className="un-trow">
                  <td className="px-2 py-2 font-semibold text-un-fg">{d || '—'}</td>
                  {matrix.statuses.map((s) => (
                    <td key={s} className="px-2 py-2 text-right tabular-nums text-un-secondary">
                      {matrix.cell(d, s)}
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
