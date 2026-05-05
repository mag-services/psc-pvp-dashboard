import { useEffect, useState } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { loadVacancyRows } from './lib/data';
import type { PageId, VacancyRow } from './lib/types';
import { ExecutiveOverview } from './pages/ExecutiveOverview';
import { MinistryDrillDown } from './pages/MinistryDrillDown';
import { RecruitmentTracker } from './pages/RecruitmentTracker';

const NAV: { id: PageId; label: string }[] = [
  { id: 'executive', label: 'Executive overview' },
  { id: 'ministry', label: 'Ministry drill-down' },
  { id: 'recruitment', label: 'Recruitment tracker' },
];

export default function App() {
  const [page, setPage] = useState<PageId>('executive');
  const [rows, setRows] = useState<VacancyRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    loadVacancyRows(ac.signal)
      .then(setRows)
      .catch((e: unknown) => {
        if ((e as { name?: string }).name === 'AbortError') return;
        setError(e instanceof Error ? e.message : 'Failed to load data');
      });
    return () => ac.abort();
  }, []);

  return (
    <div className="flex min-h-full flex-col bg-transparent">
      <div className="shadow-un-md flex shrink-0 flex-col" aria-hidden>
        <div className="h-1 bg-un-brand" />
        <div className="h-0.5 bg-gradient-to-r from-accent via-primary/80 to-accent/40" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex shrink-0 flex-col border-b border-un-border bg-un-surface shadow-[4px_0_28px_-8px_rgba(24,95,165,0.2)] dark:shadow-[4px_0_32px_-6px_rgba(0,0,0,0.55)] md:sticky md:top-0 md:h-screen md:w-64 md:overflow-y-auto md:border-b-0 md:border-r md:border-un-border">
          <div className="relative overflow-hidden bg-un-brand px-5 py-4 text-white shadow-[inset_0_-1px_0_rgb(0_0_0_/_.12),inset_0_1px_0_rgb(255_255_255_/_.14)]">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.14] via-transparent to-transparent"
              aria-hidden
            />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/92">
                Public Service Commission
              </p>
              <h1 className="mt-2 text-base font-bold leading-tight tracking-tight text-white drop-shadow-sm">
                Priority vacant posts
              </h1>
              <p className="mt-2 text-[11px] font-normal leading-snug text-white/87">
                Executive dashboard — internal management use
              </p>
            </div>
          </div>

          <nav className="relative flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:gap-1 md:overflow-visible md:px-2 md:pb-3 md:pt-3">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 hidden h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent md:block"
              aria-hidden
            />
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
                className={`whitespace-nowrap rounded-md px-3 py-2.5 text-left text-[13px] font-semibold leading-snug transition-all duration-200 md:py-2 ${
                  page === item.id
                    ? 'bg-un-wash text-un-navy shadow-un-sm ring-1 ring-primary/20 ring-offset-1 ring-offset-transparent dark:shadow-un-glow dark:ring-accent/30'
                    : 'text-un-secondary hover:bg-un-canvas hover:text-un-fg hover:shadow-un-sm'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <ThemeToggle />
        </aside>

        <main className="min-w-0 flex-1 overflow-auto px-4 py-6 md:px-10 md:py-9">
          {error ? (
            <div className="un-elevated rounded-lg border border-un-border border-l-4 border-l-un-deep bg-un-wash p-4 text-un-fg">
              <p className="text-[13px] font-bold">Could not load dataset</p>
              <p className="mt-1 text-[12px] text-un-secondary">{error}</p>
            </div>
          ) : null}

          {!error && rows === null ? (
            <p className="text-[13px] text-un-secondary">Loading ministry data…</p>
          ) : null}

          {rows && rows.length === 0 ? (
            <div className="un-elevated rounded-lg border border-un-border border-l-4 border-l-primary bg-un-wash p-4 text-un-fg">
              <p className="text-[13px] font-bold">No data rows</p>
              <p className="mt-1 text-[12px] text-un-secondary">
                Regenerate CSV with{' '}
                <code className="rounded-md border border-un-border bg-un-surface px-1.5 py-0.5 text-[11px] shadow-un-sm">
                  npm run generate-data
                </code>{' '}
                after updating the Excel file.
              </p>
            </div>
          ) : null}

          {rows && rows.length > 0 ? (
            <>
              {page === 'executive' ? <ExecutiveOverview rows={rows} /> : null}
              {page === 'ministry' ? <MinistryDrillDown rows={rows} /> : null}
              {page === 'recruitment' ? <RecruitmentTracker rows={rows} /> : null}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
