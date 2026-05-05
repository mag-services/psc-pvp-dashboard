import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, children, className = '' }: Props) {
  return (
    <section
      className={`rounded-md border border-un-border bg-un-surface p-4 shadow-un md:p-5 ${className}`}
    >
      {title ? (
        <h2 className="border-b border-un-border pb-2 text-[13px] font-bold text-un-fg">{title}</h2>
      ) : null}
      <div className={title ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}
