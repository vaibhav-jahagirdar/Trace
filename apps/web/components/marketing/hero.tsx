import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-forest/15 px-6 pb-20 pt-7 md:px-10 md:pb-28 lg:px-14">
      <div className="relative mx-auto max-w-[1440px]">
        <div className="flex items-center justify-between border-b border-forest/15 pb-5">
          <div className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-forest"><span className="inline-block size-2 rounded-full bg-olive" />Trace / hiring intelligence</div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-moss sm:block">Signal over volume</span>
        </div>

        <div className="grid gap-14 pt-18 lg:grid-cols-[minmax(0,1.45fr)_minmax(270px,0.55fr)] lg:gap-18 lg:pt-24">
          <div>
            <p className="label-index font-mono text-xs uppercase tracking-[0.2em] text-olive">The screening problem</p>
            <h1 className="mt-6 max-w-[10ch] font-sans text-[clamp(3.25rem,8.55vw,8.1rem)] font-extrabold leading-[0.84] tracking-[-0.07em] text-ink">300 applicants.<br /><span className="font-serif font-normal italic text-primary">One question.</span><br />Who is worth<br />interviewing?</h1>
            <div className="mt-12 flex max-w-2xl gap-5 md:mt-18 md:gap-8"><div className="hidden w-px shrink-0 bg-primary md:block" /><div><p className="max-w-[53ch] text-[17px] leading-[1.62] text-moss md:text-lg">Your best candidates are buried in the same pile as everyone else. Trace filters the hard gates, cuts the resume noise, and investigates the work behind the strongest candidates—so you spend your time interviewing engineers, not screening paper.</p><Link href="#access" className="mt-8 inline-flex items-center gap-4 border-b border-primary pb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:border-olive hover:text-olive">Request access <span aria-hidden>↗</span></Link></div></div>
          </div>

          <aside className="self-end lg:pb-3">
            <div className="border-y border-forest/20 py-5"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive">From pile to signal</p><div className="mt-6 space-y-0"><div className="flex items-baseline justify-between border-b border-forest/10 py-3.5"><span className="font-serif text-[21px] text-ink">Applications</span><span className="font-mono text-[21px] tabular-nums text-ink">300</span></div><div className="flex items-baseline justify-between border-b border-forest/10 py-3.5"><span className="font-serif text-[21px] text-ink">Hard-gate pass</span><span className="font-mono text-[21px] tabular-nums text-olive">184</span></div><div className="flex items-baseline justify-between border-b border-forest/10 py-3.5"><span className="font-serif text-[21px] text-ink">Source reviewed</span><span className="font-mono text-[21px] tabular-nums text-olive">42</span></div><div className="flex items-baseline justify-between py-3.5"><span className="font-serif text-[21px] text-ink">Interview time</span><span className="font-mono text-[21px] tabular-nums text-primary">10%</span></div></div></div>
            <div className="mt-7 border-l-2 border-primary pl-4"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-olive">What Trace changes</p><p className="mt-2 max-w-[30ch] font-serif text-lg leading-tight text-ink">Expensive engineering attention follows evidence, not resume polish.</p></div>
          </aside>
        </div>

        <div className="mt-20 grid border-y border-forest/15 sm:grid-cols-3 lg:mt-28"><div className="border-b border-forest/15 py-4 sm:border-b-0 sm:border-r sm:pr-6"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-olive">01 / Define</p><p className="mt-2 font-serif text-[21px] leading-none text-ink">Make the role precise.</p></div><div className="border-b border-forest/15 py-4 sm:border-b-0 sm:border-r sm:px-6"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-olive">02 / Investigate</p><p className="mt-2 font-serif text-[21px] leading-none text-ink">Follow claims into source.</p></div><div className="py-4 sm:pl-6"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-olive">03 / Decide</p><p className="mt-2 font-serif text-[21px] leading-none text-ink">Give humans better questions.</p></div></div>
      </div>
    </section>
  );
}
