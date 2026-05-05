import { NavLink } from 'react-router-dom';
import { DASHBOARD_NAV } from '../navConfig';
import { ThemeToggle } from './ThemeToggle';

const baseHref = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}`;

function IconBookGuide({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h6" />
    </svg>
  );
}

type Props = {
  onNavigate?: () => void;
};

export function AppSidebar({ onNavigate }: Props) {
  const userGuideUrl = `${baseHref}docs/user-guide.html`;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/10 bg-primary px-5 py-4 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/90">Public Service Commission</p>
        <p className="mt-2 text-[15px] font-semibold leading-snug tracking-tight text-white" id="app-product-title">
          Priority vacant posts
        </p>
        <p className="mt-2 text-[11px] font-medium leading-snug text-white/80">Executive dashboard — internal use</p>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2 md:px-1 md:py-2"
        aria-label="Dashboard sections"
      >
        {DASHBOARD_NAV.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => onNavigate?.()}
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

      <div className="mt-auto shrink-0 border-t border-un-border">
        <a
          href={userGuideUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onNavigate?.()}
          className="flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium text-un-secondary no-underline transition-colors hover:bg-un-wash hover:text-un-fg focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary"
          aria-label="Open user guide: how to update dashboard data (opens in a new tab)"
          title="How to update the dashboard"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-un-border bg-un-surface text-primary shadow-un-sm">
            <IconBookGuide className="h-4 w-4" />
          </span>
          <span className="min-w-0 leading-snug">
            <span className="block font-semibold text-un-fg">Update guide</span>
            <span className="block text-[11px] font-normal text-un-tertiary">Excel → CSV &amp; publish</span>
          </span>
        </a>
        <ThemeToggle />
      </div>
    </div>
  );
}
