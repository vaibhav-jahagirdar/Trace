"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { ChapterMark, FigureCaption } from "@/components/editorial";

/** Capability 1 — a vague role description becomes a structured hiring brief. */
function BriefDiagram({ active }: { active: boolean }) {
  const lines = ["Senior backend engineer", "5+ years, fast-paced team", "Node, Docker, k8s"];
  const brief = [
    "Owns queue-backed ingestion",
    "Debugs production concurrency",
    "Works without a platform team",
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        {lines.map((l) => (
          <div key={l} className="border border-forest/10 bg-warm px-3 py-2 text-[11px] text-stone">
            {l}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {brief.map((l, i) => (
          <div
            key={l}
            className={cn(
              "border-l-2 border-forest bg-warm px-3 py-2 text-[11px] text-ink",
              active ? "step-in" : "opacity-0",
            )}
            style={active ? { animationDelay: `${i * 180}ms` } : undefined}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Capability 2 — scattered sources become one structured report. */
function EvidenceDiagram({ active }: { active: boolean }) {
  const sources = ["Resume", "Repositories", "Portfolio", "Links"];
  return (
    <div className="flex items-center gap-6">
      <div className="flex-1 space-y-2">
        {sources.map((s, i) => (
          <div
            key={s}
            className={cn(
              "border border-forest/12 px-3 py-2 text-[11px] text-olive transition-transform duration-1000",
              active ? "translate-x-0" : "-translate-x-3 opacity-0",
            )}
            style={{ transitionDelay: `${i * 140}ms` }}
          >
            {s}
          </div>
        ))}
      </div>
      <span aria-hidden className="font-mono text-forest">
        →
      </span>
      <div
        className={cn(
          "flex-1 border border-forest/25 bg-warm p-4",
          active ? "step-in" : "opacity-0",
        )}
        style={active ? { animationDelay: "700ms" } : undefined}
      >
        <span className="label-index text-forest">One report</span>
        <div className="mt-3 space-y-1.5">
          <span className="block h-1.5 w-full bg-forest/20" />
          <span className="block h-1.5 w-4/5 bg-forest/15" />
          <span className="block h-1.5 w-3/5 bg-forest/10" />
        </div>
      </div>
    </div>
  );
}

/** Capability 3 — a large tree with the areas worth reading brought forward. */
function FocusDiagram({ active }: { active: boolean }) {
  const rows = Array.from({ length: 12 }, (_, i) => i);
  const kept = new Set([2, 5, 9]);
  return (
    <div className="space-y-1 font-mono text-[10px]">
      {rows.map((r) => (
        <div
          key={r}
          className={cn(
            "flex items-center gap-2 transition-all duration-1000",
            active && !kept.has(r) && "opacity-15",
            active && kept.has(r) && "opacity-100",
          )}
          style={{ paddingLeft: `${(r % 5) * 12}px`, transitionDelay: `${r * 60}ms` }}
        >
          <span className={kept.has(r) && active ? "text-forest" : "text-stone"}>
            {kept.has(r) && active ? "▸" : "·"}
          </span>
          <span
            className={cn("h-1.5", kept.has(r) && active ? "bg-forest/40" : "bg-stone")}
            style={{ width: `${70 + (r % 4) * 30}px` }}
          />
        </div>
      ))}
    </div>
  );
}

/** Capability 4 — a large pile becomes a short review queue and a calmer calendar. */
function AttentionDiagram({ active }: { active: boolean }) {
  return (
    <div className="grid grid-cols-3 items-end gap-4">
      <div>
        <div className="flex h-24 flex-wrap content-end gap-[3px]">
          {Array.from({ length: 48 }).map((_, i) => (
            <span key={i} className="size-1.5 bg-stone" />
          ))}
        </div>
        <span className="label-index mt-3 block text-olive">Applicants</span>
      </div>
      <div>
        <div className="flex h-24 flex-wrap content-end gap-[3px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className={cn("size-1.5 bg-forest/40", active ? "step-in" : "opacity-0")}
              style={active ? { animationDelay: `${i * 50}ms` } : undefined}
            />
          ))}
        </div>
        <span className="label-index mt-3 block text-olive">Review queue</span>
      </div>
      <div>
        <div className="grid h-24 grid-cols-5 content-end gap-[2px]">
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "aspect-square border border-forest/15 transition-colors duration-1000",
                active && [3, 8, 16].includes(i) ? "bg-forest/50" : "bg-transparent",
              )}
            />
          ))}
        </div>
        <span className="label-index mt-3 block text-olive">Interview week</span>
      </div>
    </div>
  );
}

const CAPABILITIES = [
  {
    index: "01",
    title: "Understand the role first",
    copy: "Trace begins with hiring intent — before candidates, before resumes. The role is described properly, once.",
    Diagram: BriefDiagram,
  },
  {
    index: "02",
    title: "Organise the evidence",
    copy: "What already exists about a candidate is collected into a single structured engineering report instead of eleven browser tabs.",
    Diagram: EvidenceDiagram,
  },
  {
    index: "03",
    title: "Shorten the investigation",
    copy: "A large repository becomes readable: the parts worth your attention are brought forward, the rest stays out of the way.",
    Diagram: FocusDiagram,
  },
  {
    index: "04",
    title: "Spend interview time better",
    copy: "Fewer speculative calls. More conversations with candidates who are backed by evidence for this role.",
    Diagram: AttentionDiagram,
  },
];

function CapabilityRow({
  capability,
  i,
}: {
  capability: (typeof CAPABILITIES)[number];
  i: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const { Diagram } = capability;
  const flip = i % 2 === 1;

  return (
    <div ref={ref} className="grid grid-cols-1 items-center gap-12 border-t border-forest/10 py-16 md:grid-cols-12">
      <div className={cn("md:col-span-5", flip ? "md:order-2 md:col-start-8" : "")}>
        <span className="label-index text-forest">{capability.index}</span>
        <h3 className="mt-5 text-3xl leading-tight tracking-tight text-ink">{capability.title}</h3>
        <p className="body-editorial mt-5 max-w-[38ch] text-pretty text-olive">{capability.copy}</p>
      </div>
      <figure className={cn("md:col-span-6", flip ? "md:order-1 md:col-start-1" : "md:col-start-7")}>
        <div className="border border-forest/12 bg-paper p-6">
          <Diagram active={inView} />
        </div>
        <FigureCaption id={`Fig. 8.${i + 1}`}>{capability.title}.</FigureCaption>
      </figure>
    </div>
  );
}

/** Chapter 08 — capabilities, high level only. */
export function ChapterCapabilities() {
  return (
    <section className="bg-warm px-6 py-32 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <ChapterMark index="08" label="What it does" />
        <h2 className="display-section mt-12 max-w-[24ch] text-balance text-ink">
          Four things, described plainly.
        </h2>
        <div className="mt-16">
          {CAPABILITIES.map((c, i) => (
            <CapabilityRow key={c.index} capability={c} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
