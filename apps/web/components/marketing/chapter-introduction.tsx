export function ChapterIntroduction() {
  return (
    <section className="bg-paper px-6 py-24 text-ink md:px-10 md:py-32 lg:px-14 lg:py-40">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-24">
          <div>
            <div className="flex items-center gap-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
              <span>01</span><span className="h-px w-16 bg-forest/25" /><span>The problem</span>
            </div>
            <h2 className="mt-12 max-w-[8ch] font-sans text-[clamp(3.2rem,6vw,6rem)] font-extrabold leading-[0.9] tracking-[-0.065em] text-ink md:mt-20">
              The shortlist is where hiring gets expensive.
            </h2>
          </div>

          <div className="lg:pt-20">
            <p className="max-w-[38ch] text-2xl leading-[1.3] tracking-[-0.025em] text-ink md:text-3xl">
              The applications are free. The resumes are easy to collect. The hard part starts
              when you have to decide who deserves your attention.
            </p>

            <div className="mt-14 grid max-w-2xl grid-cols-2 border-y border-forest/15 sm:grid-cols-4 sm:grid-cols-4">
              <div className="border-b border-forest/15 py-5 pr-4 sm:border-b-0 sm:border-r">
                <p className="font-mono text-3xl tabular-nums text-ink">300</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-olive">Applications</p>
              </div>
              <div className="border-b border-forest/15 py-5 pl-4 sm:border-b-0 sm:border-r sm:px-5">
                <p className="font-mono text-3xl tabular-nums text-ink">50</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-olive">Looks interesting</p>
              </div>
              <div className="py-5 pr-4 sm:border-r sm:px-5">
                <p className="font-mono text-3xl tabular-nums text-ink">8</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-olive">GitHub profiles</p>
              </div>
              <div className="border-l border-forest/15 py-5 pl-4 sm:border-l-0 sm:pl-5">
                <p className="font-mono text-3xl tabular-nums text-primary">?</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-olive">Who to interview</p>
              </div>
            </div>

            <div className="mt-16 border-l-2 border-primary pl-6 md:mt-20 md:pl-8">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-olive">The unresolved decision</p>
              <p className="mt-5 max-w-[18ch] font-sans text-[clamp(2.2rem,4vw,4rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink">
                Who should we actually interview?
              </p>
              <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-moss">
                Trace is built for this moment—when volume has become a decision, and a polished
                application is no longer enough to tell you where to spend engineering time.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-forest/15 pt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-olive md:mt-32">
          <span>Application volume</span><span className="text-primary">→</span><span>Review burden</span><span className="text-primary">→</span><span>Scarce technical attention</span>
        </div>
      </div>
    </section>
  );
}
