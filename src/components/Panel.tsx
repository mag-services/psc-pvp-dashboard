import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, children, className = '' }: Props) {
  return (
    <section
      className={`un-elevated un-elevated-hover group relative overflow-hidden rounded-lg border border-un-border bg-un-surface p-4 transition-transform duration-200 ease-out hover:-translate-y-px md:p-5 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-un-sheen opacity-[0.2] dark:opacity-[0.07]"
        aria-hidden
      />
      <div className="relative z-[1]">
        {title ? (
          <h2 className="flex items-center gap-2 border-b border-un-border pb-2 text-[13px] font-bold text-un-fg">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-sm bg-accent shadow-[0_0_10px_rgb(55_138_221_/_0.4)] ring-1 ring-white/30 dark:ring-white/10"
              aria-hidden
            />
            <span>{title}</span>
          </h2>
        ) : null}
        <div className={title ? 'mt-4' : ''}>{children}</div>
      </div>
    </section>
  );
}
