import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppSidebar } from './components/AppSidebar';
import { loadVacancyRows } from './lib/data';
import type { VacancyRow } from './lib/types';
import { ExecutiveOverview } from './pages/ExecutiveOverview';
import { MinistryDrillDown } from './pages/MinistryDrillDown';
import { RecruitmentTracker } from './pages/RecruitmentTracker';
import { useMediaQuery } from './hooks/useMediaQuery';

const SIDEBAR_ID = 'app-sidebar';

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
        {error.includes('404') || error.includes('ministries_pvp.xlsx') ? (
          <p className="mt-3 text-[12px] leading-relaxed text-un-secondary">
            The app loads{' '}
            <code className="rounded border border-un-border bg-un-surface px-1 py-0 font-mono text-[11px]">
              public/data/ministries_pvp.xlsx
            </code>{' '}
            (sheet tab <strong className="font-semibold text-un-fg">data</strong>) from the deployed site. Ensure that
            file exists in the repo before build and appears under{' '}
            <code className="rounded border border-un-border bg-un-surface px-1 py-0 font-mono text-[11px]">
              dist/data/
            </code>{' '}
            after <code className="font-mono text-[11px]">npm run build</code>.
          </p>
        ) : null}
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
          Replace{' '}
          <code className="rounded border border-un-border bg-un-surface px-1.5 py-0.5 font-mono text-[11px]">
            public/data/ministries_pvp.xlsx
          </code>{' '}
          (sheet <code className="rounded border border-un-border bg-un-surface px-1.5 py-0.5 font-mono text-[11px]">data</code>)
          and redeploy.
        </p>
      </div>
    );
  }

  return <>{children(rows)}</>;
}

function IconMenu({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      {open ? (
        <path strokeWidth={2} strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export default function App() {
  const [rows, setRows] = useState<VacancyRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const busy = !error && rows === null;

  const isMdUp = useMediaQuery('(min-width: 768px)');
  const closeSidebar = () => setSidebarOpen(false);

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

  useEffect(() => {
    if (isMdUp) setSidebarOpen(false);
  }, [isMdUp]);

  useEffect(() => {
    if (!sidebarOpen || isMdUp) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen, isMdUp]);

  useEffect(() => {
    if (!sidebarOpen || isMdUp) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen, isMdUp]);

  const drawerOpen = sidebarOpen && !isMdUp;

  return (
    <div className="flex min-h-full flex-col bg-transparent">
      <div className="flex shrink-0 flex-col border-b border-un-border md:border-b-0" aria-hidden>
        <div className="h-1 bg-primary" />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        {drawerOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden motion-reduce:backdrop-blur-none"
            aria-label="Close menu"
            onClick={closeSidebar}
          />
        ) : null}

        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-un-border bg-un-surface px-3 shadow-un-sm md:hidden">
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-un-border bg-un-surface text-un-fg shadow-un-sm hover:bg-un-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-expanded={sidebarOpen}
            aria-controls={SIDEBAR_ID}
            onClick={() => setSidebarOpen((o) => !o)}
          >
            <span className="sr-only">{sidebarOpen ? 'Close menu' : 'Open menu'}</span>
            <IconMenu open={sidebarOpen} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-un-tertiary">
              Public Service Commission
            </p>
            <p className="truncate text-[13px] font-semibold leading-snug text-un-fg">Priority vacant posts</p>
          </div>
        </header>

        <aside
          id={SIDEBAR_ID}
          aria-label="Dashboard navigation"
          className={[
            'flex shrink-0 flex-col overflow-hidden border-un-border bg-un-surface shadow-un-sm',
            'fixed inset-y-0 left-0 z-50 w-[min(20rem,calc(100vw-2.5rem))] border-r transition-transform duration-200 ease-out motion-reduce:transition-none',
            isMdUp || sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'md:relative md:inset-y-auto md:left-auto md:z-0 md:h-screen md:w-64 md:max-w-none md:translate-x-0 md:overflow-y-auto md:border-b-0 md:border-r',
            'md:sticky md:top-0',
          ].join(' ')}
          aria-hidden={!isMdUp && !sidebarOpen ? true : undefined}
        >
          <AppSidebar onNavigate={closeSidebar} />
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-auto px-4 py-6 md:px-10 md:py-9" aria-busy={busy}>
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
