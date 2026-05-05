import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useMemo, useState } from 'react';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import { deptStatusMatrix, postsByDepartment, topSalaryScales } from '../lib/data';
import { formatInt, formatVuv } from '../lib/format';
import type { VacancyRow } from '../lib/types';

type Props = { rows: VacancyRow[] };

const colHelper = createColumnHelper<VacancyRow>();

export function MinistryDrillDown({ rows }: Props) {
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
      plotOptions: { column: { borderRadius: 2, color: '#185FA5' as Highcharts.ColorString } },
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
      plotOptions: { column: { borderRadius: 2, color: '#378ADD' as Highcharts.ColorString } },
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
    return <p className="text-sm text-slate-600">No rows loaded.</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Ministry drill-down</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Focus on departments, salary scales, and highest-cost posts within a ministry.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase text-slate-500">
          Ministry
          <select
            className="min-w-[220px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-sm outline-none ring-accent focus:border-primary focus:ring-2"
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
          <HighchartsReact highcharts={Highcharts} options={deptChart} />
        </Panel>
        <Panel title="">
          <HighchartsReact highcharts={Highcharts} options={scaleChart} />
        </Panel>
      </div>

      <Panel title="Top 20 posts by annual salary">
        <div className="overflow-auto rounded-lg border border-slate-100">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-600">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-3 py-2">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
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
        <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-100">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-2 py-2">Department</th>
                {matrix.statuses.map((s) => (
                  <th key={s} className="px-2 py-2 text-right">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.depts.map((d) => (
                <tr key={d} className="border-t border-slate-100">
                  <td className="px-2 py-2 font-medium text-slate-800">{d || '—'}</td>
                  {matrix.statuses.map((s) => (
                    <td key={s} className="px-2 py-2 text-right tabular-nums text-slate-700">
                      {matrix.cell(d, s) || ''}
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
