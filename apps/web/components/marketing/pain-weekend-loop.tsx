"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { ChapterMark, FigureCaption, Reveal } from "@/components/editorial";

const TABS = [
  "resume_03.pdf", "github.com/avery", "linkedin.com/in/avery", "portfolio",
  "resume_17.pdf", "notes.txt", "github.com/…", "resume_11.pdf",
];

const DOCS = [
  { id: "03", rotate: -5, x: 0, y: 0 },
  { id: "17", rotate: 3, x: 27, y: 14 },
  { id: "30", rotate: -2, x: 54, y: 28 },
  { id: "11", rotate: 4, x: 81, y: 42 },
  { id: "50", rotate: -1, x: 108, y: 56 },
];

export function PainWeekendLoop() {
  const { ref, inView } = useInView(0.25);

  return (
    <section ref={ref} className="border-t border-forest/20 bg-moss px-6 py-24 text-paper md:px-12 md:py-32 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <ChapterMark index="02" label="The review loop" tone="paper" />

        <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="max-w-[12ch] font-sans text-[clamp(2.7rem,4vw,3.7rem)]  leading-[0.94] tracking-[-0.055em] text-paper">
                Open.<br />Compare.<br />Lose the thread.
              </h2>
            </Reveal>

            <Reveal delay={0.15} className="mt-8">
              <p className="max-w-[39ch] text-base leading-[1.7] text-paper/76">
                Resume. LinkedIn. GitHub. Portfolio. Another repository. Another candidate.
                Every application asks you to reconstruct the comparison from scratch.
              </p>
            </Reveal>

            <Reveal delay={0.25} className="mt-10 border-l border-sage pl-5">
              <p className="max-w-[31ch] font-sans text-lg font-normal leading-[1.3] text-paper">
                By candidate 30, the reason candidate 3 looked stronger than candidate 17 has
                become another thing to recover.
              </p>
            </Reveal>
          </div>

          <figure className="lg:col-span-7">
            <div className={cn("relative overflow-hidden border border-ink/20 bg-paper text-ink", inView && "weekend-loop-running")}>
              <header className="flex items-center justify-between border-b border-ink/15 px-4 py-3">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-moss">
                  <span className="size-1.5 rounded-full bg-destructive" /> Sunday review
                </div>
                <span className="weekend-clock font-mono text-[10px] text-ink/55">8:47 PM</span>
              </header>

              <div className="weekend-tabs flex gap-px overflow-hidden border-b border-ink/15 bg-ink/15 px-3 pt-3">
                {TABS.map((tab, index) => (
                  <div
                    key={`${tab}-${index}`}
                    className={cn("weekend-tab !border-ink/15 !bg-paper !text-ink/80", `weekend-tab-${index}`, !inView && "opacity-0")}
                  >
                    <span className="size-1 shrink-0 rounded-full bg-moss/70" />
                    <span className="truncate">{tab}</span>
                    <span className="text-ink/35">×</span>
                  </div>
                ))}
              </div>

              <div className="relative min-h-[362px] px-6 py-6 sm:px-8">
                <div className="flex items-end justify-between border-b border-ink/15 pb-4">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[.15em] text-moss">Review workspace</p>
                    <p className="mt-2 font-sans text-xl font-medium tracking-[-.025em]">Fifty candidates. One remembered note.</p>
                  </div>
                  <p className="text-right font-mono text-[9px] leading-4 text-destructive">147 switches<br />unresolved</p>
                </div>

                <div className="relative h-[248px] overflow-hidden">
                  <div className="absolute left-2 top-7 h-48 w-48 sm:left-8">
                    {DOCS.map((document, index) => (
                      <article
                        key={document.id}
                        className={cn(
                          "weekend-document absolute flex h-48 w-36 flex-col border border-ink/20 bg-warm p-3 sm:w-40",
                          `weekend-document-${index}`,
                        )}
                        style={{ transform: `translate(${document.x}px, ${document.y}px) rotate(${document.rotate}deg)` }}
                      >
                        <span className="font-mono text-[9px] uppercase tracking-[.1em] text-moss">candidate_{document.id}</span>
                        <span className="mt-5 h-px w-full bg-ink/25" />
                        <span className="mt-3 h-px w-5/6 bg-ink/15" />
                        <span className="mt-3 h-px w-2/3 bg-ink/15" />
                        <span className="mt-auto h-px w-1/2 bg-ink/15" />
                      </article>
                    ))}
                  </div>

                  <aside className="absolute right-0 top-9 hidden w-40 border-l border-ink/15 pl-4 sm:block">
                    <p className="font-mono text-[9px] uppercase tracking-[.12em] text-moss">Decision note</p>
                    <p className="mt-3 font-sans text-base font-medium leading-[1.25] text-ink">Candidate 03 looked stronger.</p>
                    <p className="weekend-note-fade mt-4 font-mono text-[10px] text-destructive">Reason missing.</p>
                  </aside>

                  <div aria-hidden className="weekend-overload pointer-events-none absolute inset-0" />
                </div>

                <div className="border-t border-ink/15 pt-4">
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[.12em] text-ink/55">
                    <span>Scratch notes</span><span className="text-destructive">Memory unstable</span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <p className="font-mono text-[10px] text-ink/70">→ strong communicator</p>
                    <p className="font-mono text-[10px] text-ink/70">→ compare to #03</p>
                    <p className="weekend-note-fade font-mono text-[10px] text-ink/70">→ revisit tomorrow</p>
                  </div>
                </div>
              </div>

              <footer className="flex items-center justify-between border-t border-ink/15 px-5 py-3 font-mono text-[10px] text-ink/55">
                <span>candidate memory: <b className="font-normal text-destructive">fading</b></span>
                <span>decision: unresolved</span>
              </footer>
            </div>

            <Reveal delay={0.4} className="mt-5">
              <FigureCaption id="Fig. 2.1" tone="paper">Attention spent reconstructing candidates, not evaluating engineers.</FigureCaption>
            </Reveal>
          </figure>
        </div>

        <Reveal delay={0.5} className="mt-16 border-t border-paper/20 pt-6">
          <p className="max-w-[48ch] font-sans text-lg font-normal leading-[1.35] text-paper md:text-xl">
            Too much time spent switching context. Not enough spent making the decision.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
