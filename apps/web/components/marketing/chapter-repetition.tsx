"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { ChapterMark, FigureCaption, Reveal } from "@/components/editorial";

const CLAIMS = [
  "Built scalable systems",
  "Designed secure authentication",
  "Improved system performance",
  "Owned end-to-end delivery",
  "Built distributed backend",
  "Designed microservice architecture",
];

const STACKS = ["Node.js", "TypeScript", "Docker", "Kubernetes", "PostgreSQL", "Redis", "AWS"];

/** Chapter 03 — repeated claims make strong candidates difficult to distinguish. */
export function ChapterRepetition() {
  const { ref, inView } = useInView(0.25);
  const rows = Array.from({ length: 10 }, (_, index) => ({
    claim: CLAIMS[index % CLAIMS.length],
    candidate: ["03", "17", "30", "11", "50"][index % 5],
    stack: `${STACKS[index % STACKS.length]} · ${STACKS[(index + 3) % STACKS.length]}`,
  }));

  return (
    <section ref={ref} className="border-t border-paper/10 bg-forest px-6 py-24 text-paper md:px-12 md:py-32 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:col-span-5">
            <ChapterMark index="03" label="The signal problem" tone="paper" />
            <Reveal>
              <h2 className="mt-12 max-w-[11ch] font-sans text-[clamp(2.7rem,4vw,3.7rem)] font-normal leading-[0.94] tracking-[-0.055em]">
                Different<br />people.<br />Same resume.
              </h2>
            </Reveal>
            <Reveal delay={0.15} className="mt-8">
              <p className="max-w-[39ch] text-base leading-[1.7] text-paper/76">
                “Built scalable systems.” “Designed secure authentication.” “Improved performance.”
                <br /><br />After enough applications, the words stop helping you distinguish anyone.
              </p>
            </Reveal>
          </div>

          <figure className="lg:col-span-7">
            <div className="relative overflow-hidden border border-paper/15 bg-paper text-ink">
              <header className="flex items-center justify-between border-b border-ink/15 px-5 py-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[.16em] text-moss">Surface signal</p>
                  <p className="mt-1 font-sans text-lg font-medium tracking-[-.02em]">Claim language, repeated</p>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[.12em] text-ink/45">06 patterns / 50 candidates</span>
              </header>
              <div className="relative h-[390px] overflow-hidden">
                <div className={cn("claim-marquee-track", inView && "animate-marquee")} style={{ animationDuration: "24s" }}>
                  {[0, 1].map((pass) => (
                    <div key={pass} aria-hidden={pass === 1}>
                      {rows.map((row, index) => (
                        <div key={`${pass}-${index}`} className="flex min-h-[52px] items-center justify-between gap-5 border-b border-ink/10 px-5 py-3 sm:px-7">
                          <div className="flex min-w-0 items-center gap-4">
                            <span className="font-mono text-[9px] tracking-[.12em] text-ink/38">#{row.candidate}</span>
                            <span className="truncate font-sans text-[15px] font-medium text-ink/82">{row.claim}</span>
                          </div>
                          <span className="hidden shrink-0 font-mono text-[9px] uppercase tracking-[.1em] text-moss/70 sm:block">{row.stack}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-paper to-transparent" />
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper to-transparent" />
              </div>
              <footer className="flex items-center justify-between border-t border-ink/15 px-5 py-3 font-mono text-[9px] uppercase tracking-[.12em] text-ink/45">
                <span>Signal resolution: low</span><span>Context required</span>
              </footer>
            </div>
            <Reveal delay={0.35} className="mt-5">
              <FigureCaption id="Fig. 3.1" tone="paper">The same claims recur. The useful difference lives in the work behind them.</FigureCaption>
            </Reveal>
          </figure>
        </div>

        <Reveal delay={0.45} className="mt-20 border-t border-paper/15 pt-8">
          <p className="max-w-[22ch] font-sans text-3xl font-light font-sans tracking-[-.045em] text-paper">
            When everyone sounds qualified, the resume stops being useful.
          </p>
          <p className="mt-6 max-w-[43ch] text-base leading-[1.7] text-sage">You need something stronger than another keyword match.</p>
        </Reveal>
      </div>
    </section>
  );
}
