"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { ChapterMark, FigureCaption, Reveal } from "@/components/editorial";

const CASCADE = [
  ["Weeks 1—4", "Onboarding", "Two senior engineers pair instead of ship."],
  ["Weeks 4—12", "Review load", "Pull requests take three passes, not one."],
  ["Month 4", "Production incident", "Rollback, postmortem, hardening work."],
  ["Month 5", "Roadmap slip", "Committed work moves to the next quarter."],
  ["Month 6", "Decision", "Someone raises it with the founder."],
  ["Month 7+", "Replacement hiring", "The weekend review loop begins again."],
];

export function ChapterCostProcess() {
  const { ref, inView } = useInView(0.2);
  return <>
    <section ref={ref} className="bg-warm px-6 py-24 text-ink md:px-12 md:py-32 lg:px-20"><div className="mx-auto max-w-6xl"><div className="grid gap-14 lg:grid-cols-12 lg:gap-16"><div className="lg:col-span-4"><ChapterMark index="05" label="The cost" /><Reveal><h2 className="mt-12 max-w-[10ch] font-sans text-[clamp(2.7rem,4vw,3.7rem)] font-normal leading-[.94] tracking-[-.055em]">The wrong hire<br />keeps<br />charging you.</h2></Reveal><Reveal delay={.15} className="mt-8"><p className="max-w-[34ch] text-base leading-[1.7] text-olive">Senior engineers pair longer. Reviews slow down. Roadmaps move. Production gets harder. Eventually, someone has to fix the hiring decision — and the whole search starts again.</p></Reveal></div><figure className="lg:col-span-8"><div className="border-t border-forest/15">{CASCADE.map(([window, event, detail], i) => <div key={event} className={cn("grid grid-cols-12 items-baseline gap-4 border-b border-forest/10 py-6", inView ? "step-in" : "opacity-0")} style={{ animationDelay: `${i * 130}ms` }}><span className="label-index col-span-12 text-forest sm:col-span-3">{window}</span><span className="col-span-12 font-sans text-xl font-medium tracking-tight text-ink sm:col-span-4" style={{ paddingLeft: `${i * 6}px` }}>{event}</span><span className="col-span-12 text-sm leading-6 text-olive sm:col-span-5">{detail}</span></div>)}</div><FigureCaption id="Fig. 5.1">The cost compounds long after the interview ends.</FigureCaption></figure></div></div></section>
  </>;
}
