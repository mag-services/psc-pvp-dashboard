import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Fragment, useMemo } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import {
  countActiveRecruitment,
  deptSummary,
  ministryAggregates,
  sum,
} from '../lib/data';
import { formatInt, formatVuv, formatVuvMillions } from '../lib/format';
import type { VacancyRow } from '../lib/types';

type Props = { rows: VacancyRow[] };

export function ExecutiveOverview({ rows }: Props) {
  const { theme } = useTheme();
  const totalPosts = rows.length;
  const totalSalary = sum(rows, (r) => r.annualSalary);
  const activeRecruitment = countActiveRecruitment(rows);
  const byMinPosts = ministryAggregates(rows);
  const byMinSalary = useMemo(() => [...byMinPosts].sort((a, b) => b.salary - a.salary), [byMinPosts]);
  const summary = deptSummary(rows);

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
    const map = new Map<string, typeof summary>();
    for (const r of summary) {
      const list = map.get(r.ministry) ?? [];
      list.push(r);
      map.set(r.ministry, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [summary]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[22px] font-bold tracking-tight text-un-fg">Executive overview</h1>
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
            <thead className="un-thead">
              <tr>
                <th className="px-3 py-2.5 font-semibold normal-case tracking-normal text-un-secondary">Ministry</th>
                <th className="px-3 py-2.5 font-semibold normal-case tracking-normal text-un-secondary">Department</th>
                <th className="px-3 py-2.5 text-right font-semibold normal-case tracking-normal text-un-secondary">Posts</th>
                <th className="px-3 py-2.5 text-right font-semibold normal-case tracking-normal text-un-secondary">
                  Annual salary (VUV)
                </th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(([ministry, depts]) => (
                <Fragment key={ministry}>
                  <tr className="bg-un-canvas">
                    <td colSpan={4} className="px-3 py-2 text-[12px] font-bold text-primary">
                      {ministry}
                    </td>
                  </tr>
                  {depts.map((d) => (
                    <tr key={`${ministry}__${d.department}`} className="un-trow">
                      <td className="px-3 py-2 text-un-tertiary"> </td>
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
