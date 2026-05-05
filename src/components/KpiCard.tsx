type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function KpiCard({ label, value, hint }: Props) {
  return (
    <div className="rounded-md border border-un-border border-l-4 border-l-primary bg-un-surface p-5 shadow-un">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-un-tertiary">{label}</p>
      <p className="mt-3 text-[28px] font-normal leading-none tracking-tight text-un-fg">{value}</p>
      {hint ? <p className="mt-3 text-[12px] leading-snug text-un-secondary">{hint}</p> : null}
    </div>
  );
}
