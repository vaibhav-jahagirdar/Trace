"use client";

import { useEffect, useState } from "react";

const chevron = Array.from({ length: 9 }, (_, index) => {
  const row = Math.floor(index / 3);
  const column = index % 3;
  return (column + Math.abs(row - 1)) * 90;
});
const orbitOrder = [0, 1, 2, 5, 8, 7, 6, 3];
const orbit = Array.from({ length: 9 }, (_, index) => {
  const position = orbitOrder.indexOf(index);
  return position === -1 ? null : position * 110;
});
const patterns: Record<string, { delays: (number | null)[]; duration: number; round: boolean }> = {
  Drive: { delays: chevron, duration: 650, round: false },
  Dots: { delays: chevron, duration: 650, round: true },
  Orbit: { delays: orbit, duration: 950, round: false },
};

function useElapsed() {
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTicks((value) => value + 1), 100);
    return () => window.clearInterval(timer);
  }, []);
  const seconds = ticks / 10;
  return seconds < 60 ? `${seconds.toFixed(1)}s` : `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(1)}s`;
}

export function LoadingState({ label = "Analyzing", variant = "Drive" }: { label?: string; variant?: string }) {
  const elapsed = useElapsed();
  const pattern = patterns[variant] ?? patterns.Drive;
  return <span className="inline-flex items-center gap-2.5 text-olive" role="status" aria-live="polite"><span aria-hidden className="grid grid-cols-[repeat(3,4px)] gap-[1.5px]">{pattern.delays.map((delay, index) => <span key={index} className={`size-1 bg-forest ${pattern.round ? "rounded-full" : "rounded-[1px]"}`} style={{ opacity: delay === null ? 0.08 : 0.18, animation: delay === null ? "none" : `trace-pixel-on ${pattern.duration}ms ease-in-out ${delay}ms infinite` }} />)}</span><span className="trace-shimmer-text text-xs font-medium">{label}</span><span className="font-mono text-[11px] tabular-nums text-olive/75">{elapsed}</span></span>;
}
