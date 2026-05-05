type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function KpiCard({ label, value, hint }: Props) {
  return (
    <div className="un-elevated un-elevated-hover group relative overflow-hidden rounded-lg border border-un-border border-l-[3px] border-l-primary bg-un-surface transition-all duration-200 ease-out hover:-translate-y-0.5">
      <div
        className="pointer-events-none absolute inset-0 bg-un-sheen opacity-[0.5] dark:opacity-[0.09]"
        aria-hidden
      />
      <div className="relative z-[1] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-un-tertiary">{label}</p>
        <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight text-un-fg">{value}</p>
        {hint ? <p className="mt-3 text-[12px] leading-snug text-un-secondary">{hint}</p> : null}
      </div>
      <div
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-70"
        aria-hidden
      />
    </div>
  );
}
