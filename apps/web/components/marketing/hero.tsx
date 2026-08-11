"use client";

import { Reveal } from "@/components/editorial";
import Link from "next/link";

export function Hero() {
  return (
    <section className="px-8 pb-40 pt-32">
      <div className="mx-auto max-w-[1440px]">
        <h1
          style={{
            fontFamily: 'var(--font-primary)',
            fontWeight: 800,
            fontSize: 'clamp(3.5rem, 9vw, 8.5rem) !important',
            lineHeight: 0.88,
            letterSpacing: '-0.05em',
          }}
          className="max-w-6xl"
        >
          Stop reading
          <br />
          every resume.
          <br />
          <span className="font-serif font-semibold italic text-primary">
            Start reading
            <br />
            evidence.
          </span>
        </h1>

        <div className="mt-20 flex gap-16">
          <div className="rule-draw hidden w-px bg-primary md:block" />
          <div className="max-w-[46ch]">
            <p className="text-xl leading-relaxed">
              Trace does not look for the best engineer. It answers one question: given this
              job, which applicants deserve expensive human interview time?
            </p>
            <Link
              href="#access"
              className="mt-10 inline-block border-b border-primary pb-1 font-mono text-[11px] uppercase tracking-[0.22em] text-primary"
            >
              Request access
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}