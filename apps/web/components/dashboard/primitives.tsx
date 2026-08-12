export function PanelHead({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-baseline justify-between gap-5 border-b border-forest/12 pb-5">
      <h2 className="font-mono text-sm uppercase tracking-[0.16em] text-forest">{label}</h2>
      {count !== undefined && <span className="font-mono text-sm tabular-nums text-olive">{count}</span>}
    </div>
  );
}

export function EmptyPanel({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-24 items-center border-y border-forest/12 bg-warm px-5 py-6 text-sm leading-relaxed text-olive"><span className="mr-3 size-1.5 shrink-0 rounded-full bg-olive/50" aria-hidden="true" />{children}</div>;
}
