"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { ChapterMark, FigureCaption, Reveal } from "@/components/editorial";

type TreeNode = { depth: number; name: string; kind: "dir" | "file" };

const TREE: TreeNode[] = [
  { depth: 0, name: "repository/", kind: "dir" },
  { depth: 1, name: "packages/", kind: "dir" },
  { depth: 2, name: "core/", kind: "dir" },
  { depth: 3, name: "src/", kind: "dir" },
  { depth: 4, name: "adapters/", kind: "dir" },
  { depth: 5, name: "queue/", kind: "dir" },
  { depth: 6, name: "consumer.ts", kind: "file" },
  { depth: 6, name: "retry.ts", kind: "file" },
  { depth: 5, name: "storage/", kind: "dir" },
  { depth: 6, name: "index.ts", kind: "file" },
  { depth: 4, name: "domain/", kind: "dir" },
  { depth: 5, name: "entities/", kind: "dir" },
  { depth: 6, name: "account.ts", kind: "file" },
  { depth: 3, name: "test/", kind: "dir" },
  { depth: 4, name: "fixtures/", kind: "dir" },
  { depth: 2, name: "cli/", kind: "dir" },
  { depth: 3, name: "commands/", kind: "dir" },
  { depth: 1, name: "infra/", kind: "dir" },
  { depth: 2, name: "terraform/", kind: "dir" },
  { depth: 3, name: "modules/", kind: "dir" },
  { depth: 1, name: "scripts/", kind: "dir" },
  { depth: 2, name: "codegen/", kind: "dir" },
];

export function ChapterRepository() {
  const { ref, inView } = useInView(0.2);

  return (
    <section ref={ref} className="border-t border-forest/12 bg-paper px-6 py-24 text-ink md:px-12 md:py-32 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:col-span-5">
            <ChapterMark index="04" label="No entry point" />
            <Reveal>
              <h2 className="mt-12 max-w-[11ch] font-sans text-[clamp(2.7rem,4vw,3.7rem)] font-normal font-sans leading-[.94] tracking-[-.055em]">
                Then you<br />open<br />GitHub.
              </h2>
            </Reveal>
            <Reveal delay={0.15} className="mt-8">
              <p className="max-w-[39ch] text-base leading-[1.7] text-olive">
                Eight repositories. Thousands of files. A README, a monorepo, a dozen abstractions — and no indication where the claim you care about actually lives.
              </p>
            </Reveal>
          </div>

          <figure className="lg:col-span-7">
            <div className="relative overflow-hidden border border-forest/15 bg-warm">
              <header className="flex items-center justify-between border-b border-forest/15 px-5 py-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[.16em] text-olive">Repository browser</p>
                  <p className="mt-1 font-sans text-lg font-sans font-medium tracking-[-.02em]">No obvious place to begin</p>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[.12em] text-ink/45">depth: unbounded</span>
              </header>
              <div className="relative h-[390px] overflow-hidden px-5 py-5 sm:px-7">
                <div className="font-mono text-[11px] leading-[1.85] text-olive">
                  {TREE.map((node, index) => (
                    <div key={`${node.name}-${index}`} className={cn("flex items-center gap-2 whitespace-nowrap", inView ? "step-in" : "opacity-0")} style={{ paddingLeft: `${node.depth * 14}px`, animationDelay: `${index * 55}ms`, opacity: inView ? Math.max(.34, 1 - index * .025) : 0 }}>
                      <span className="text-forest/30">{node.depth ? "└─" : "·"}</span>
                      <span className={node.kind === "dir" ? "text-ink/80" : "text-olive"}>{node.name}</span>
                    </div>
                  ))}
                  <div className="mt-3 space-y-1 text-ink/35"><div>… 2,492 more entries</div><div>… 4,103 more entries</div><div>… 9,821 more entries</div></div>
                </div>
                <div aria-hidden className={cn("absolute size-3 text-ink/65 transition-all duration-[2200ms] ease-out", inView ? "left-[43%] top-[68%]" : "left-[28%] top-[28%]")}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 2l14 9-6 1-3 7-3-1 3-7-5 4z" /></svg>
                </div>
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-warm to-transparent" />
              </div>
              <footer className="flex items-center justify-between border-t border-forest/15 px-5 py-3 font-mono text-[9px] uppercase tracking-[.12em] text-ink/45"><span>files indexed: 9,842</span><span>claim location: unknown</span></footer>
            </div>
            <Reveal delay={0.35} className="mt-5"><FigureCaption id="Fig. 4.1">A repository is not evidence until you find the part that proves the claim.</FigureCaption></Reveal>
          </figure>
        </div>

        <Reveal delay={0.45} className="mt-20 border-t border-forest/15 pt-8">
          <p className="max-w-[20ch]  text-3xl font-sans leading-[.98] tracking-[-.055em]">You don’t need to read the repository.</p>
          <p className="mt-6 max-w-[43ch] text-base leading-[1.7] text-olive">You need to find the few parts of it that are actually worth reading.</p>
        </Reveal>
      </div>
    </section>
  );
}
