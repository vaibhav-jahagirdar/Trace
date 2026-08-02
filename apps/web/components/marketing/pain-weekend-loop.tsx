"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChapterMark,
  EditorialContainer,
  EditorialParagraph,
  EditorialRule,
  FigureCaption,
  Reveal,
  SectionHeading,
} from "@/components/editorial";

function useInView(threshold = 0.25) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(element);
      }
    }, { threshold });

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

const TABS = ["resume_03.pdf", "github.com/avery", "linkedin.com/in/avery", "portfolio", "notes.txt"];

const CANDIDATES = [
  { id: "03", name: "Avery Chen", role: "Platform engineer", detail: "Strong systems work?", state: "first seen" },
  { id: "17", name: "Maya Patel", role: "Frontend engineer", detail: "Was this the ML project?", state: "re-opened" },
  { id: "50", name: "Jon Bell", role: "Backend engineer", detail: "Need to compare later", state: "unscored" },
];

export function PainWeekendLoop() {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} className="border-t border-forest/10 bg-moss text-paper">
      <EditorialContainer width="story" spacing="xl">
        <ChapterMark index="02" label="The weekend loop" tone="paper" />

        <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHeading size="hero" style={{fontWeight: 400}}>
                Open.
                <br />
                Close.
                <br />
                Next.
              </SectionHeading>
            </Reveal>

            <Reveal delay={0.15} className="mt-10">
              <EditorialParagraph className="text-stone/75">
                Resume. GitHub. LinkedIn. Portfolio. Back to the resume.
                <br />
                <br />
                Every application asks for a fresh comparison. By Sunday evening,
                candidate three and candidate fifty have started to blur together.
              </EditorialParagraph>
            </Reveal>

            <Reveal delay={0.3} className="mt-12">
              <EditorialRule width="md" tone="paper" />
            </Reveal>
          </div>

          <figure className="lg:col-span-7">
            <div className={`weekend-loop relative min-h-107.5 overflow-hidden border border-paper/10 bg-black/15 ${inView ? "weekend-loop-running" : ""}`}>
              <div className="flex items-center justify-between border-b border-paper/10 px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-sage/65">
                  <span className="size-1.5 rounded-full bg-red-300/80" />
                  Sunday review
                </div>
                <span className="weekend-clock font-mono text-[10px] text-paper/45">8:47 PM</span>
              </div>

              <div className="weekend-tabs flex gap-1 overflow-hidden border-b border-paper/10 px-3 pt-3">
                {TABS.map((tab, index) => (
                  <div key={tab} className={`weekend-tab weekend-tab-${index}`}>
                    <span className="size-1 rounded-full bg-sage/60" />
                    <span className="truncate">{tab}</span>
                    <span className="text-paper/35">×</span>
                  </div>
                ))}
              </div>

              <div className="relative grid gap-3 p-5 sm:grid-cols-[1fr_10.5rem]">
                <div className="relative min-h-67.5">
                  <div className="mb-3 flex items-end justify-between">
                    <div>
                      <p className="label-index tracking-[0.15em] text-sage/55">Applications reviewed</p>
                      <p className="mt-1 font-serif text-3xl text-paper">50 <span className="text-base text-paper/35">/ 86</span></p>
                    </div>
                    <p className="weekend-counter text-right font-mono text-[10px] leading-4 text-red-200/75">12 tabs open<br />3 notes missing</p>
                  </div>

                  <div className="space-y-2">
                    {CANDIDATES.map((candidate, index) => (
                      <article key={candidate.id} className={`weekend-candidate weekend-candidate-${index}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-sage/55">#{candidate.id}</span>
                          <span className="text-[9px] uppercase tracking-[0.12em] text-red-200/70">{candidate.state}</span>
                        </div>
                        <p className="mt-1 text-sm text-paper/90">{candidate.name}</p>
                        <p className="text-[10px] text-sage/60">{candidate.role}</p>
                        <p className="mt-3 border-t border-paper/10 pt-2 text-[10px] italic text-paper/50">“{candidate.detail}”</p>
                      </article>
                    ))}
                  </div>
                </div>

                <aside className="weekend-notes border border-paper/10 bg-paper/[0.035] p-3">
                  <p className="label-index tracking-[0.14em] text-sage/55">Scratch notes</p>
                  <div className="mt-4 space-y-3 font-mono text-[10px] leading-4 text-paper/45">
                    <p>→ strong communicator</p>
                    <p>→ which one shipped payments?</p>
                    <p className="line-through opacity-50">→ compare to #03</p>
                    <p className="weekend-note-fade">→ revisit tomorrow</p>
                  </div>
                </aside>

                <div aria-hidden className="weekend-overload absolute inset-0 pointer-events-none" />
              </div>

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-paper/10 px-5 py-3 font-mono text-[10px] text-paper/40">
                <span>context switches: <b className="font-normal text-red-200/75">147</b></span>
                <span className="weekend-memory">memory of #03: fading</span>
              </div>
            </div>

            <Reveal delay={0.45} className="mt-6">
              <FigureCaption id="Fig. 2.1" tone="paper">
                Attention spent reconstructing context, not comparing engineers.
              </FigureCaption>
            </Reveal>
          </figure>
        </div>
      </EditorialContainer>
    </section>
  );
}
