import { Link, useLocation } from 'react-router-dom';

const CRUMB: Record<string, string> = {
  '/executive': 'Executive overview',
  '/ministry': 'Ministry drill-down',
  '/recruitment': 'Recruitment tracker',
};

export function PageBreadcrumb() {
  const { pathname } = useLocation();
  const page = pathname === '/' ? '/executive' : pathname;
  const label = CRUMB[page] ?? 'Dashboard';

  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-x-1.5 text-[12px] text-un-secondary">
      <Link
        to="/executive"
        className="font-medium text-primary no-underline hover:underline focus:outline-none focus-visible:underline"
      >
        Dashboard
      </Link>
      <span aria-hidden className="text-un-tertiary">
        /
      </span>
      <span className="font-medium text-un-fg">{label}</span>
    </nav>
  );
}
