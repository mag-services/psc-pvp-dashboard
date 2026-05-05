import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { ThemeToggle } from './components/ThemeToggle';
import { loadVacancyRows } from './lib/data';
import type { PageId, VacancyRow } from './lib/types';
import { ExecutiveOverview } from './pages/ExecutiveOverview';
import { MinistryDrillDown } from './pages/MinistryDrillDown';
import { RecruitmentTracker } from './pages/RecruitmentTracker';

const NAV: { id: PageId; path: string; label: string }[] = [
  { id: 'executive', path: '/executive', label: 'Executive overview' },
  { id: 'ministry', path: '/ministry', label: 'Ministry drill-down' },
  { id: 'recruitment', path: '/recruitment', label: 'Recruitment tracker' },
];

function MainContent({
  rows,
  error,
  children,
}: {
  rows: VacancyRow[] | null;
  error: string | null;
  children: (rows: VacancyRow[]) => ReactNode;
}) {
  if (error) {
    return (
      <div className="rounded-md border border-un-border border-l-4 border-l-un-deep bg-un-wash p-4 text-un-fg shadow-un-sm">
        <p className="text-[13px] font-semibold">Could not load dataset</p>
        <p className="mt-1 text-[12px] text-un-secondary">{error}</p>
      </div>
    );
  }

  if (rows === null) {
    return (
      <p className="text-[13px] text-un-secondary" role="status" aria-live="polite">
        Loading ministry data…
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-un-border border-l-4 border-l-primary bg-un-wash p-4 text-un-fg shadow-un-sm">
        <p className="text-[13px] font-semibold">No data rows</p>
        <p className="mt-1 text-[12px] text-un-secondary">
          Regenerate CSV with{' '}
          <code className="rounded border border-un-border bg-un-surface px-1.5 py-0.5 font-mono text-[11px]">
            npm run generate-data
          </code>{' '}
          after updating the Excel file.
        </p>
      </div>
    );
  }

  return <>{children(rows)}</>;
}

export default function App() {
  const [rows, setRows] = useState<VacancyRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = !error && rows === null;

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
            <p className="mt-2 text-[15px] font-semibold leading-snug tracking-tight text-white" id="app-product-title">
              Priority vacant posts
            </p>
            <p className="mt-2 text-[11px] font-medium leading-snug text-white/80">Executive dashboard — internal use</p>
          </div>

          <nav className="flex gap-0.5 overflow-x-auto px-2 py-2 md:flex-col md:overflow-visible md:px-1 md:py-2" aria-label="Dashboard sections">
            {NAV.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `no-underline whitespace-nowrap rounded-sm border-l-2 border-y-0 border-r-0 border-transparent px-3 py-2.5 text-left text-[13px] font-medium leading-snug md:py-2 ${
                    isActive
                      ? 'border-l-primary bg-un-wash font-semibold text-un-fg'
                      : 'text-un-secondary hover:bg-un-canvas hover:text-un-fg'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <ThemeToggle />
        </aside>

        <main className="min-w-0 flex-1 overflow-auto px-4 py-6 md:px-10 md:py-9" aria-busy={busy}>
          <Routes>
            <Route path="/" element={<Navigate to="/executive" replace />} />
            <Route
              path="/executive"
              element={
                <MainContent rows={rows} error={error}>
                  {(r) => <ExecutiveOverview rows={r} />}
                </MainContent>
              }
            />
            <Route
              path="/ministry"
              element={
                <MainContent rows={rows} error={error}>
                  {(r) => <MinistryDrillDown rows={r} />}
                </MainContent>
              }
            />
            <Route
              path="/recruitment"
              element={
                <MainContent rows={rows} error={error}>
                  {(r) => <RecruitmentTracker rows={r} />}
                </MainContent>
              }
            />
            <Route path="*" element={<Navigate to="/executive" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
