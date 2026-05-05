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
      <div className="flex shrink-0 flex-col border-b border-un-border md:border-b-0" aria-hidden>
        <div className="h-1 bg-primary" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex shrink-0 flex-col border-b border-un-border bg-un-surface shadow-un-sm md:sticky md:top-0 md:h-screen md:w-64 md:overflow-y-auto md:border-b-0 md:border-r md:border-un-border">
          <div className="border-b border-white/10 bg-primary px-5 py-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/90">
              Public Service Commission
            </p>
            <h1 className="mt-2 text-[15px] font-semibold leading-snug tracking-tight text-white">
              Priority vacant posts
            </h1>
            <p className="mt-2 text-[11px] font-medium leading-snug text-white/80">
              Executive dashboard — internal use
            </p>
          </div>

          <nav className="flex gap-0.5 overflow-x-auto px-2 py-2 md:flex-col md:overflow-visible md:px-1 md:py-2">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
                className={`whitespace-nowrap rounded-sm border-l-2 border-y-0 border-r-0 border-transparent px-3 py-2.5 text-left text-[13px] font-medium leading-snug md:py-2 ${
                  page === item.id
                    ? 'border-l-primary bg-un-wash font-semibold text-un-fg'
                    : 'text-un-secondary hover:bg-un-canvas hover:text-un-fg'
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
            <div className="rounded-md border border-un-border border-l-4 border-l-un-deep bg-un-wash p-4 text-un-fg shadow-un-sm">
              <p className="text-[13px] font-bold">Could not load dataset</p>
              <p className="mt-1 text-[12px] text-un-secondary">{error}</p>
            </div>
          ) : null}

          {!error && rows === null ? (
            <p className="text-[13px] text-un-secondary">Loading ministry data…</p>
          ) : null}

          {rows && rows.length === 0 ? (
            <div className="rounded-md border border-un-border border-l-4 border-l-primary bg-un-wash p-4 text-un-fg shadow-un-sm">
              <p className="text-[13px] font-bold">No data rows</p>
              <p className="mt-1 text-[12px] text-un-secondary">
                Regenerate CSV with{' '}
                <code className="rounded border border-un-border bg-un-surface px-1.5 py-0.5 font-mono text-[11px]">
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
