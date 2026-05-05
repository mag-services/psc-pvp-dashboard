import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, children, className = '' }: Props) {
  return (
    <section
      className={`un-elevated rounded-md border border-un-border bg-un-surface p-4 md:p-5 ${className}`}
    >
      {title ? (
        <h2 className="border-l-2 border-primary pl-2.5 text-[13px] font-semibold uppercase tracking-wide text-un-fg">
          {title}
        </h2>
      ) : null}
      <div className={title ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}
